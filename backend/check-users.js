require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkSchema() {
  const { data, error } = await supabase.from('utilisateurs').select('avatar_url').limit(1);
  if (error) {
    console.error('Error (column might not exist):', error.message);
  } else {
    console.log("Column exists!");
  }
}
checkSchema();
