const http = require('http');

async function request(url, options = {}) {
    return new Promise((resolve, reject) => {
        const u = new URL(url);
        const reqOpts = {
            hostname: u.hostname,
            port: u.port || 80,
            path: u.pathname + u.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };
        const req = http.request(reqOpts, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: data ? JSON.parse(data) : null
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: data
                    });
                }
            });
        });
        req.on('error', reject);
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        req.end();
    });
}

async function start() {
    console.log('🔄 Checking all endpoints on http://localhost:3000...\n');
    const baseUrl = 'http://localhost:3000/api';

    try {
        // Setup Business User for Auth
        console.log('0. Setting up Admin/Business user for Auth...');
        const uniqueAdminEmail = `audit_admin_${Date.now()}@example.com`;
        const authRes = await request(`${baseUrl}/auth/signup`, {
            method: 'POST',
            body: {
                name: 'Audit Admin',
                email: uniqueAdminEmail,
                password: 'securepassword123',
                role: 'admin'
            }
        });
        const token = authRes.data.token;
        const authHeader = { 'Authorization': `Bearer ${token}` };

        // 1. Create a Hospital
        console.log('1. Creating Hospital...');
        const hRes = await request(`${baseUrl}/hospitals`, {
            method: 'POST',
            headers: authHeader,
            body: {
                businessName: 'Apollo Hospital',
                address1: 'EM Bypass Road',
                address2: 'Block A',
                city: 'Kolkata',
                businessPhone: '033-234567'
            }
        });
        console.log(`   Response Status: ${hRes.status}`);
        console.log('   Data:', JSON.stringify(hRes.data, null, 2));

        if (hRes.status !== 201) {
            throw new Error(`Failed to create hospital (Status: ${hRes.status})`);
        }

        const hospitalId = hRes.data.data._id;

        // 2. Fetch all hospitals
        console.log('\n2. Fetching all hospitals...');
        const listHRes = await request(`${baseUrl}/hospitals`);
        console.log(`   Response Status: ${listHRes.status}`);
        console.log(`   Total Hospitals Found: ${listHRes.data.count}`);

        // 3. Create a Department for that hospital
        console.log('\n3. Creating Department under hospital...');
        const dRes = await request(`${baseUrl}/departments`, {
            method: 'POST',
            body: {
                name: 'Neurology',
                description: 'Brain & nerve specialist clinic',
                hospitalId: hospitalId
            }
        });
        console.log(`   Response Status: ${dRes.status}`);
        console.log('   Data:', JSON.stringify(dRes.data, null, 2));

        if (dRes.status !== 201) {
            throw new Error(`Failed to create department (Status: ${dRes.status})`);
        }

        const departmentId = dRes.data.data._id;

        // 4. Fetch departments filtered by hospitalId
        console.log('\n4. Fetching departments under hospital...');
        const listDRes = await request(`${baseUrl}/departments?hospitalId=${hospitalId}`);
        console.log(`   Response Status: ${listDRes.status}`);
        console.log(`   Departments Found: ${listDRes.data.count}`);

        // 5. Create a Service
        console.log('\n5. Creating Service...');
        const sRes = await request(`${baseUrl}/services`, {
            method: 'POST',
            body: {
                name: 'EEG Brain Scan',
                description: 'Electroencephalogram scan',
                price: 2500,
                duration: 45,
                hospitalId: hospitalId,
                departmentId: departmentId
            }
        });
        console.log(`   Response Status: ${sRes.status}`);
        console.log('   Data:', JSON.stringify(sRes.data, null, 2));

        if (sRes.status !== 201) {
            throw new Error(`Failed to create service (Status: ${sRes.status})`);
        }

        const serviceId = sRes.data.data._id;

        // 6. Fetch services
        console.log('\n6. Fetching services...');
        const listSRes = await request(`${baseUrl}/services?hospitalId=${hospitalId}`);
        console.log(`   Response Status: ${listSRes.status}`);
        console.log(`   Services Found: ${listSRes.data.count}`);

        // 7. Update Hospital
        console.log('\n7. Updating Hospital...');
        const updateHRes = await request(`${baseUrl}/hospitals/${hospitalId}`, {
            method: 'PUT',
            headers: authHeader,
            body: { name: 'Apollo Gleneagles Hospital' }
        });
        console.log(`   Response Status: ${updateHRes.status}`);
        console.log(`   Updated Name: ${updateHRes.data.data.name}`);

        // 8. Update Department
        console.log('\n8. Updating Department...');
        const updateDRes = await request(`${baseUrl}/departments/${departmentId}`, {
            method: 'PUT',
            body: { description: 'Super-specialty neurology and neurosurgery' }
        });
        console.log(`   Response Status: ${updateDRes.status}`);
        console.log(`   Updated Description: ${updateDRes.data.data.description}`);

        // 9. Update Service
        console.log('\n9. Updating Service...');
        const updateSRes = await request(`${baseUrl}/services/${serviceId}`, {
            method: 'PUT',
            body: { price: 2800 }
        });
        console.log(`   Response Status: ${updateSRes.status}`);
        console.log(`   Updated Price: ${updateSRes.data.data.price}`);

        // 10. Delete Service
        console.log('\n10. Deleting Service...');
        const deleteSRes = await request(`${baseUrl}/services/${serviceId}`, {
            method: 'DELETE'
        });
        console.log(`   Response Status: ${deleteSRes.status}`);

        // 11. Delete Department
        console.log('\n11. Deleting Department...');
        const deleteDRes = await request(`${baseUrl}/departments/${departmentId}`, {
            method: 'DELETE'
        });
        console.log(`   Response Status: ${deleteDRes.status}`);

        // 12. Delete Hospital
        console.log('\n12. Deleting Hospital...');
        const deleteHRes = await request(`${baseUrl}/hospitals/${hospitalId}`, {
            method: 'DELETE',
            headers: authHeader
        });
        console.log(`   Response Status: ${deleteHRes.status}`);

        console.log('\n✅ EVERYTHING IS WORKING CORRECTLY!');
    } catch (error) {
        console.error('\n❌ ERROR TESTING ENDPOINTS:');
        console.error(error);
        console.log('Is your server running on port 3000? Start it with: npm run dev');
    }
}

start();
