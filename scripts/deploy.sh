#!/bin/bash
set -e

echo "======================================"
echo "🚀 Vercel Deployment Script (startupIQ)"
echo "======================================"

# Safely load variables from .env if it exists to use as default values
if [ -f .env ]; then
  echo "Loading default values from .env..."
  while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ $key == \#* ]] || [[ -z $key ]]; then
      continue
    fi
    # Remove surrounding quotes from value
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    export "$key=$value"
  done < .env
fi

# Function to prompt for an environment variable
prompt_env() {
  local var_name=$1
  local default_val="${!var_name}"
  local user_input
  
  # Print the prompt to stderr so we can capture the return value from stdout
  read -p "Enter $var_name [${default_val}]: " user_input >&2
  
  if [ -z "$user_input" ]; then
    echo "$default_val"
  else
    echo "$user_input"
  fi
}

echo ""
echo "Please provide/verify the required environment variables for deployment:"
echo "(Press Enter to use the default value shown in brackets)"
echo ""

# --- Core variables ---
DATABASE_URL=$(prompt_env "DATABASE_URL")
APP_URL=$(prompt_env "APP_URL")

# --- AI APIs ---
ANTHROPIC_API_KEY=$(prompt_env "ANTHROPIC_API_KEY")
GROQ_API_KEY=$(prompt_env "GROQ_API_KEY")
GEMINI_API_KEY=$(prompt_env "GEMINI_API_KEY")
TAVILY_API_KEY=$(prompt_env "TAVILY_API_KEY")

# --- Payments (Razorpay) ---
RAZORPAY_KEY_ID=$(prompt_env "RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET=$(prompt_env "RAZORPAY_KEY_SECRET")
RAZORPAY_WEBHOOK_SECRET=$(prompt_env "RAZORPAY_WEBHOOK_SECRET")

# --- Redis Cache ---
REDIS_HOST=$(prompt_env "REDIS_HOST")
REDIS_PORT=$(prompt_env "REDIS_PORT")

echo ""
echo "======================================"
echo "Starting Vercel deployment..."
echo "======================================"

# Run the vercel deploy command with the provided environment variables
npx vercel --prod \
  --env DATABASE_URL="$DATABASE_URL" \
  --env APP_URL="$APP_URL" \
  --env ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  --env GROQ_API_KEY="$GROQ_API_KEY" \
  --env GEMINI_API_KEY="$GEMINI_API_KEY" \
  --env TAVILY_API_KEY="$TAVILY_API_KEY" \
  --env RAZORPAY_KEY_ID="$RAZORPAY_KEY_ID" \
  --env RAZORPAY_KEY_SECRET="$RAZORPAY_KEY_SECRET" \
  --env RAZORPAY_WEBHOOK_SECRET="$RAZORPAY_WEBHOOK_SECRET" \
  --env REDIS_HOST="$REDIS_HOST" \
  --env REDIS_PORT="$REDIS_PORT"

echo "======================================"
echo "✅ Deployment completed successfully!"
