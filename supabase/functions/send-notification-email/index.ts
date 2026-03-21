import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const SITE_NAME = 'Flintyo'
const SENDER_DOMAIN = 'notify.flintyo.com'
const FROM_DOMAIN = 'flintyo.com'
const SITE_URL = 'https://flintyo.com'

function buildEmailHtml(title: string, body: string, ctaText?: string, ctaUrl?: string): string {
  const ctaBlock = ctaText && ctaUrl
    ? `<a href="${ctaUrl}" style="display:inline-block;background-color:#0ea5e9;color:#ffffff;font-size:14px;font-weight:bold;border-radius:12px;padding:14px 28px;text-decoration:none;margin:10px 0 20px;">${ctaText}</a>`
    : ''

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background-color:#0c1222;font-family:'Space Grotesk',Arial,sans-serif;margin:0;padding:0;">
<div style="max-width:480px;margin:0 auto;padding:40px 25px;">
  <p style="font-size:20px;font-weight:bold;color:#0ea5e9;margin:0 0 30px;">⚡ Flintyo</p>
  <h1 style="font-size:24px;font-weight:bold;color:#e8eaed;margin:0 0 20px;">${title}</h1>
  <p style="font-size:14px;color:#8b8fa3;line-height:1.6;margin:0 0 20px;">${body}</p>
  ${ctaBlock}
  <p style="font-size:12px;color:#555770;margin:30px 0 0;">You're receiving this because of your activity on Flintyo.</p>
</div>
</body></html>`
}

function buildPlainText(title: string, body: string, ctaText?: string, ctaUrl?: string): string {
  let text = `${title}\n\n${body}`
  if (ctaText && ctaUrl) text += `\n\n${ctaText}: ${ctaUrl}`
  return text
}

interface EmailContent {
  subject: string
  html: string
  text: string
}

function getEmailContent(type: string, title: string, message: string, link: string | null): EmailContent {
  const ctaUrl = link ? `${SITE_URL}${link}` : SITE_URL

  switch (type) {
    case 'clash_challenge':
      return {
        subject: '⚔️ New Clash Challenge!',
        html: buildEmailHtml(title, message, 'View Challenge', ctaUrl),
        text: buildPlainText(title, message, 'View Challenge', ctaUrl),
      }
    case 'clash_accepted':
      return {
        subject: '⚔️ Challenge Accepted!',
        html: buildEmailHtml(title, message, 'Join Debate', ctaUrl),
        text: buildPlainText(title, message, 'Join Debate', ctaUrl),
      }
    case 'clash_result':
      return {
        subject: '🏆 Clash Results',
        html: buildEmailHtml(title, message, 'View Results', ctaUrl),
        text: buildPlainText(title, message, 'View Results', ctaUrl),
      }
    case 'chat_match':
      return {
        subject: '💬 Chat Matched!',
        html: buildEmailHtml(title, message, 'Open Chat', ctaUrl),
        text: buildPlainText(title, message, 'Open Chat', ctaUrl),
      }
    case 'comment':
      return {
        subject: '💬 New Comment on Your Flint',
        html: buildEmailHtml(title, message, 'View Discussion', ctaUrl),
        text: buildPlainText(title, message, 'View Discussion', ctaUrl),
      }
    case 'rank_change':
      return {
        subject: '🎖️ You Ranked Up!',
        html: buildEmailHtml(title, message, 'View Profile', `${SITE_URL}/profile`),
        text: buildPlainText(title, message, 'View Profile', `${SITE_URL}/profile`),
      }
    default:
      return {
        subject: title,
        html: buildEmailHtml(title, message, 'Open Flintyo', SITE_URL),
        text: buildPlainText(title, message, 'Open Flintyo', SITE_URL),
      }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { user_id, type, title, message, link } = await req.json()

    if (!user_id || !type || !title || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Look up user email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', user_id)
      .single()

    if (userError || !user?.email) {
      console.error('User lookup failed', { user_id, error: userError })
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const emailContent = getEmailContent(type, title, message, link)
    const messageId = crypto.randomUUID()

    // Try to enqueue via pgmq (if email infrastructure is provisioned)
    const { error: enqueueError } = await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        message_id: messageId,
        to: user.email,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        purpose: 'transactional',
        label: type,
        queued_at: new Date().toISOString(),
      },
    })

    if (enqueueError) {
      console.warn('Email enqueue failed (infrastructure may not be ready)', {
        error: enqueueError,
        type,
        email: user.email,
      })
      // Don't fail the request — in-app notification was already created
      return new Response(
        JSON.stringify({ success: true, email_queued: false, reason: 'infrastructure_pending' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log send attempt
    try {
      await supabase.from('email_send_log').insert({
        message_id: messageId,
        template_name: type,
        recipient_email: user.email,
        status: 'pending',
      })
    } catch {
      // email_send_log may not exist yet
    }

    console.log('Notification email enqueued', { type, email: user.email, messageId })

    return new Response(
      JSON.stringify({ success: true, email_queued: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-notification-email:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
