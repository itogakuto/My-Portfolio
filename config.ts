export const CONFIG = {
  SUPABASE: {
    // Project URL derived from the project ID found in the connection string
    URL: process.env.SUPABASE_URL || 'https://qgcgrabzlpfpdfehmcla.supabase.co',
    ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnY2dyYWJ6bHBmcGRmZWhtY2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MzUwNDMsImV4cCI6MjA4NDUxMTA0M30.z3pX4iySJw6RGN8QRD2jdVKOUzbOOSTBlWNePwTgrsA',
  },
  EMAILJS: {
    // 以下の情報を書き換えてください
    SERVICE_ID: process.env.EMAILJS_SERVICE_ID || 'service_8a89n8d',
    TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID || 'template_di9knrk',
    PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY || 'zwNSb0fvV4eZyLi8u',
  }
};