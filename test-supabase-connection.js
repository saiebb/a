// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');

// Use the environment variables from .env.local.mcp
// Using the actual Supabase URL instead of localhost
const supabaseUrl = 'https://hqcjfmzbukchvbagviwt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxY2pmbXpidWtjaHZiYWd2aXd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDY5ODM4MCwiZXhwIjoyMDYwMjc0MzgwfQ.ixSsmtPYhha3zYwa-wRaOwsvHbTSjBh64sRSpXB_eyk';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test the connection by fetching users
async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('*').limit(5);

    if (error) {
      console.error('Error connecting to Supabase:', error);
    } else {
      console.log('Successfully connected to Supabase!');
      console.log('Users data:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the test
testConnection();
