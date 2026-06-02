const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  try {
    // Query to get all tables in the public schema
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (error) {
      // Try alternative approach using RPC
      const { data: tables, error: rpcError } = await supabase.rpc('exec_sql', {
        query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `
      });
      
      if (rpcError) {
        console.error('Error:', rpcError);
        process.exit(1);
      }
      
      console.log('Tables in database:');
      console.log(JSON.stringify(tables, null, 2));
    } else {
      console.log('Tables in database:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Exception:', err.message);
    process.exit(1);
  }
}

listTables();
