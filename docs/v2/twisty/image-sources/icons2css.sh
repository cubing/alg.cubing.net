#!/bin/bash

function svg {
  ICON_CLASS="${1}"
  FILE="${2}"
  BASE64=$(openssl base64 < "${FILE}" | tr -d "\n")
  echo "twisty twisty-control-bar button.${ICON_CLASS} { background-image: url('data:image/svg+xml;base64,${BASE64}'); }"
}

svg "skip-to-start" "font-awesome/fast-backward.svg"
svg "skip-to-end" "font-awesome/fast-forward.svg"
svg "step-forward" "font-awesome/mail-forward.svg"
svg "step-backward" "font-awesome/mail-reply.svg"
svg "pause" "font-awesome/pause.svg"
svg "play" "font-awesome/play.svg"

svg "enter-fullscreen" "google/ic_fullscreen_black_24px.svg"
svg "exit-fullscreen" "google/ic_fullscreen_exit_black_24px.svg"
