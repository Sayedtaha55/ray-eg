# File Upload Security

## Allowed Types

Images

PDF

Documents

Videos

Only if required.

-------------------------------------

## Validation

Check MIME Type

Check Extension

Check File Size

Check Image Dimensions

Check Content

Reject Unknown Types

-------------------------------------

## Virus Protection

Future

ClamAV

Cloud Antivirus

-------------------------------------

## Images

Process using Sharp

Strip Metadata

Generate Multiple Sizes

Optimize

Never trust image headers.

-------------------------------------

## Videos

Process using FFmpeg

Validate Duration

Validate Codec

Generate Preview

Limit Resolution

-------------------------------------

## Storage

Never store uploads inside application server.

Store in S3 Compatible Storage.

Private by default.

Use Signed URLs.

-------------------------------------

## File Names

Generate UUID.

Never use user filename.

-------------------------------------

## Dangerous Files

Reject

exe

bat

cmd

dll

js

php

sh

jar

apk

msi

ps1

-------------------------------------

## Limits

Profile Images

5 MB

Documents

20 MB

Videos

200 MB

Configurable per module.

-------------------------------------

## Permissions

Only owner can access private files.

Business files require business permissions.

-------------------------------------

## Logging

Log

Upload

Delete

Download

Permission Changes