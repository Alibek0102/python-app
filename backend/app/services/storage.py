import uuid
from pathlib import PurePosixPath

import boto3
from botocore.client import Config

from app.core.config import settings


ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}


def _client():
    return boto3.client(
        "s3",
        endpoint_url=settings.MINIO_ENDPOINT,
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",
    )


def upload_image(data: bytes, filename: str, content_type: str) -> str:
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError(f"Unsupported content type: {content_type}")

    ext = PurePosixPath(filename or "").suffix.lower() or ""
    key = f"products/{uuid.uuid4().hex}{ext}"

    client = _client()
    client.put_object(
        Bucket=settings.MINIO_BUCKET,
        Key=key,
        Body=data,
        ContentType=content_type,
    )

    return f"{settings.MINIO_PUBLIC_ENDPOINT}/{settings.MINIO_BUCKET}/{key}"
