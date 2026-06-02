const http = require('http');

const API_URL = 'http://localhost:3000/api/v1';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;
if (!TEST_USER_PASSWORD) throw new Error('Missing required environment variable: TEST_USER_PASSWORD');

const testUsers = [
  { email: 'admin@day1main.com', password: TEST_USER_PASSWORD, role: 'System Admin' },
  { email: 'member@day1main.com', password: TEST_USER_PASSWORD, role: 'Member' },
  { email: 'broker@day1main.com', password: TEST_USER_PASSWORD, role: 'Broker' },
  { email: 'assessor@day1main.com', password: TEST_USER_PASSWORD, role: 'Claims Assessor' },
  { email: 'compliance@day1main.com', password: TEST_USER_PASSWORD, role: 'Compliance Officer' },
  { email: 'finance@day1main.com', password: TEST_USER_PASSWORD, role: 'Finance Manager' },
];

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const fullPath = path.startsWith('/api/v1') ? path : `/api/v1${path}`;
    const url = new URL(fullPath, 'http://localhost:3000');
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: response, headers: res.headers });
        } catch (err) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testFullLoginFlow(email, password, role) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔐 Testing: ${email} (${role})`);
  console.log('='.repeat(60));

  try {
    // Step 1: Login
    console.log('\n1️⃣  POST /auth/login');
    const loginRes = await makeRequest('POST', '/auth/login', { email, password });
    
    if (loginRes.status !== 200) {
      console.log(`   ❌ Login failed (${loginRes.status})`);
      console.log(`   Response:`, JSON.stringify(loginRes.data, null, 2));
      return false;
    }

    console.log(`   ✅ Login successful (${loginRes.status})`);
    const { user, access_token, refresh_token } = loginRes.data;
    console.log(`   User ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Roles: ${user.roles?.join(', ')}`);
    console.log(`   Access Token: ${access_token ? 'Present' : 'Missing'}`);
    console.log(`   Refresh Token: ${refresh_token ? 'Present' : 'Missing'}`);

    if (!access_token) {
      console.log(`   ❌ No access token returned`);
      return false;
    }

    // Step 2: Get current user with token
    console.log('\n2️⃣  GET /auth/me (with token)');
    const meRes = await makeRequest('GET', '/auth/me', null, access_token);
    
    if (meRes.status !== 200) {
      console.log(`   ❌ Get user failed (${meRes.status})`);
      console.log(`   Response:`, JSON.stringify(meRes.data, null, 2));
      return false;
    }

    console.log(`   ✅ Get user successful (${meRes.status})`);
    console.log(`   User ID: ${meRes.data.id}`);
    console.log(`   Email: ${meRes.data.email}`);
    console.log(`   Roles: ${meRes.data.roles?.join(', ')}`);
    console.log(`   Permissions: ${meRes.data.permissions?.length || 0} permissions`);

    // Step 3: Test protected endpoint (audit events)
    console.log('\n3️⃣  GET /audit/events (protected endpoint)');
    const auditRes = await makeRequest('GET', '/audit/events', null, access_token);
    
    if (auditRes.status === 401) {
      console.log(`   ⚠️  Unauthorized (${auditRes.status}) - Token might be invalid`);
      return false;
    } else if (auditRes.status === 403) {
      console.log(`   ⚠️  Forbidden (${auditRes.status}) - User lacks permissions`);
    } else if (auditRes.status === 200) {
      console.log(`   ✅ Access granted (${auditRes.status})`);
    } else {
      console.log(`   ℹ️  Response (${auditRes.status})`);
    }

    // Step 4: Logout
    console.log('\n4️⃣  POST /auth/logout');
    const logoutRes = await makeRequest('POST', '/auth/logout', null, access_token);
    
    if (logoutRes.status !== 200) {
      console.log(`   ⚠️  Logout returned (${logoutRes.status})`);
    } else {
      console.log(`   ✅ Logout successful (${logoutRes.status})`);
    }

    console.log(`\n✅ FULL FLOW SUCCESSFUL for ${email}`);
    return true;

  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     TESTING FRONTEND LOGIN FLOW FOR ALL USER PROFILES     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  let successCount = 0;
  let failCount = 0;

  for (const testUser of testUsers) {
    const success = await testFullLoginFlow(testUser.email, testUser.password, testUser.role);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }

  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                      FINAL RESULTS                        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`✅ Successful: ${successCount}/${testUsers.length}`);
  console.log(`❌ Failed: ${failCount}/${testUsers.length}`);
  console.log('');

  if (failCount === 0) {
    console.log('🎉 All user profiles can login successfully!\n');
  } else {
    console.log('⚠️  Some profiles failed - check errors above\n');
  }
}

runAllTests();
