import asyncio
import json
import logging
import time
import uuid
from datetime import datetime, timedelta, timezone

import pytz

import db
from notify import (
    notify_booking_cancelled,
    notify_booking_confirmed,
    notify_call_no_booking,
)
from outbound_calls import dispatch_outbound_call

logger = logging.getLogger("automation")

_IST = pytz.timezone("Asia/Kolkata")

def parse_bool(value, default: bool) -> bool:
    if value in (None, ""):
        return default
    if isinstance(value, bool):
        return value
    text = str(value).strip().lower()
    if text in {"1", "true", "yes", "on"}:
        return True
    if text in {"0", "false", "no", "off"}:
        return False
    return default


def parse_int(value, default: int) -> int:
    if value in (None, ""):
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def parse_hours_list(value, default: list[int]) -> list[int]:
    if value in (None, ""):
        return list(default)
    if isinstance(value, list):
        numbers = []
        for item in value:
            try:
                numbers.append(int(item))
            except (TypeError, ValueError):
                continue
        return numbers or list(default)
    parts = [segment.strip() for segment in str(value).split(",") if segment.strip()]
    numbers = []
    for item in parts:
        try:
            numbers.append(int(float(item)))
        except (TypeError, ValueError):
            continue
    return numbers or list(default)


def get_runtime_config(config: dict | None = None) -> dict:
    config = config or {}
    return {
        "whatsapp_enabled": parse_bool(config.get("whatsapp_enabled", True), True),
        "booking_reminder_offsets_hours": parse_hours_list(config.get("booking_reminder_offsets_hours"), [24, 2]),
        "no_booking_followup_offsets_hours": parse_hours_list(config.get("no_booking_followup_offsets_hours"), [2, 24]),
        "followup_call_next_day_hour_ist": parse_int(config.get("followup_call_next_day_hour_ist"), 11),
        "automation_business_hours_only": parse_bool(config.get("automation_business_hours_only", True), True),
    }


def ensure_default_templates() -> list[dict]:
    return []


def process_due_jobs(*, limit: int = 10, config: dict | None = None) -> list[dict]:
    return []






def format_booking_context(
    *,
    caller_name: str,
    phone_number: str,
    booking_time_iso: str = "",
    booking_id: str = "",
    call_summary: str = "",
) -> dict[str, str]:
    context = {
        "caller_name": caller_name or "there",
        "phone_number": db.normalize_phone_number(phone_number),
        "booking_id": booking_id or "",
        "call_summary": call_summary or "",
        "booking_date": "",
        "booking_time": "",
    }
    if booking_time_iso:
        try:
            dt = datetime.fromisoformat(booking_time_iso)
            if dt.tzinfo is None:
                dt = _IST.localize(dt)
            dt = dt.astimezone(_IST)
            context["booking_date"] = dt.strftime("%A, %d %B %Y")
            context["booking_time"] = dt.strftime("%I:%M %p IST")
        except Exception:
            context["booking_date"] = booking_time_iso
            context["booking_time"] = booking_time_iso
    return context


def _make_idempotency_key(*parts: object) -> str:
    cleaned = [str(part).strip().lower().replace(" ", "_") for part in parts if str(part).strip()]
    return ":".join(cleaned)


def _appointment_id(appointment: dict) -> str:
    return str(appointment.get("id") or "")


def _appointment_start_dt(appointment: dict) -> datetime:
    value = appointment.get("scheduled_start") or appointment.get("start_time")
    if not value:
        raise ValueError("Appointment scheduled_start is required.")
    dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = _IST.localize(dt)
    return dt.astimezone(_IST)


def next_business_day_at(hour_ist: int) -> datetime:
    now = datetime.now(_IST)
    candidate = (now + timedelta(days=1)).replace(hour=hour_ist, minute=0, second=0, microsecond=0)
    while candidate.weekday() == 6:
        candidate += timedelta(days=1)
    return candidate


def shift_into_business_hours(candidate: datetime) -> datetime:
    local = candidate.astimezone(_IST)
    while local.weekday() == 6:
        local = (local + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)

    open_hour = 10
    close_hour = 17 if local.weekday() == 5 else 19
    start = local.replace(hour=open_hour, minute=0, second=0, microsecond=0)
    end = local.replace(hour=close_hour, minute=0, second=0, microsecond=0)
    if local < start:
        return start
    if local >= end:
        next_day = (local + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
        return shift_into_business_hours(next_day)
    return local


def queue_followup_call(
    *,
    phone_number: str,
    caller_name: str = "",
    scheduled_for: str,
    trigger_event: str,
    related_call_room_id: str = "",
    related_appointment_id=None,
    payload: dict | None = None,
    idempotency_key: str,
) -> dict | None:
    return db.create_automation_job(
        {
            "channel": "call",
            "trigger_event": trigger_event,
            "phone_number": db.normalize_phone_number(phone_number),
            "caller_name": caller_name,
            "scheduled_for": scheduled_for,
            "status": "pending_review",
            "related_call_room_id": related_call_room_id or None,
            "related_appointment_id": related_appointment_id,
            "payload": payload or {},
            "idempotency_key": idempotency_key,
        }
    )




def handle_booking_confirmed(
    *,
    appointment: dict,
    caller_name: str = "",
    phone_number: str = "",
    notes: str = "",
    tts_voice: str = "",
    ai_summary: str = "",
    config: dict | None = None,
) -> list[dict]:
    appointment_id = str(appointment.get("id") or "")
    booking_dt = str(appointment.get("scheduled_start") or "")
    notify_booking_confirmed(
        caller_name=caller_name or appointment.get("contact_name") or "",
        caller_phone=phone_number or appointment.get("contact_phone") or "",
        booking_time_iso=booking_dt,
        booking_id=appointment_id,
        notes=notes,
        tts_voice=tts_voice,
        ai_summary=ai_summary,
        config=config,
    )
    return []


def handle_appointment_updated(appointment: dict, *, config: dict | None = None) -> list[dict]:
    appointment_id = str(appointment.get("id") or "")
    if appointment_id:
        db.cancel_automation_jobs(related_appointment_id=appointment_id)
    return []


def handle_appointment_cancelled(
    appointment: dict,
    *,
    reason: str = "",
    config: dict | None = None,
) -> list[dict]:
    appointment_id = str(appointment.get("id") or "")
    notify_booking_cancelled(
        caller_name=appointment.get("contact_name") or "",
        caller_phone=appointment.get("contact_phone") or "",
        booking_id=appointment_id,
        reason=reason,
        config=config,
    )
    return []


def handle_call_no_booking(
    *,
    caller_name: str,
    phone_number: str,
    call_summary: str,
    related_call_room_id: str,
    config: dict | None = None,
) -> list[dict]:
    notify_call_no_booking(
        caller_name=caller_name,
        caller_phone=phone_number,
        call_summary=call_summary,
        ai_summary=call_summary,
        config=config,
    )
    return []


async def launch_followup_call_job(job_id: str | int, *, config: dict | None = None) -> dict:
    job = db.get_automation_job(job_id)
    if not job:
        raise ValueError(f"Automation job {job_id} not found.")
    if job.get("channel") != "call":
        raise ValueError("Job is not a call follow-up.")
    phone = db.normalize_phone_number(job.get("phone_number") or "")
    if not phone:
        raise ValueError("Call follow-up phone number is missing.")

    payload = job.get("payload") or {}
    result = await dispatch_outbound_call(
        phone,
        config=config,
        caller_name=job.get("caller_name") or "",
        extra_metadata={
            "automation_job_id": str(job["id"]),
            "trigger_event": job.get("trigger_event") or "manual_followup_call",
            "call_summary": payload.get("call_summary") or "",
        },
    )
    db.update_automation_job(
        job["id"],
        {
            "status": "launched",
            "dispatch_id": result.get("dispatch_id"),
        },
    )
    return result


