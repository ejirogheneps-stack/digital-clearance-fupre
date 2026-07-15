const http = require("http");

const APP_URL = "http://localhost:3000";

function makeRequest(url, method = "GET", headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsedData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsedData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("\n==========================================");
  console.log("STARTING DSCS BACKEND API VERIFICATION TESTS");
  console.log("==========================================\n");

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      testPassed++;
    } else {
      console.error(`[FAIL] ${message}`);
      testFailed++;
    }
  }

  try {
    // Test 1: Public endpoint (should fail auth check or return default)
    console.log("Test 1: Accessing profile without token...");
    const res1 = await makeRequest(`${APP_URL}/api/students/me`);
    assert(
      res1.status === 401,
      `Accessing /api/students/me without token returned status 401 (got ${res1.status})`
    );

    // Test 2: Student Login
    console.log("\nTest 2: Logging in student...");
    const loginRes = await makeRequest(`${APP_URL}/api/auth/login`, "POST", {}, {
      email: "student@fupre.edu.ng",
      password: "studentpassword"
    });
    
    assert(loginRes.status === 200, `Student login returned status 200 (got ${loginRes.status})`);
    assert(loginRes.body.accessToken !== undefined, "Response body contains accessToken");
    assert(loginRes.body.user?.role === "STUDENT", `User role is 'STUDENT' (got '${loginRes.body.user?.role}')`);

    const studentToken = loginRes.body.accessToken;

    // Test 3: Get Student Profile
    console.log("\nTest 3: Fetching student profile...");
    const profileRes = await makeRequest(`${APP_URL}/api/students/me`, "GET", {
      "Authorization": `Bearer ${studentToken}`
    });
    
    assert(profileRes.status === 200, `Fetching profile returned status 200 (got ${profileRes.status})`);
    assert(profileRes.body.matricNumber === "CSC/2021/001", `Matric number matches 'CSC/2021/001' (got '${profileRes.body.matricNumber}')`);
    assert(profileRes.body.department === "Computer Science", `Department is 'Computer Science'`);

    // Test 4: Get Clearance Status
    console.log("\nTest 4: Fetching student clearance status...");
    const statusRes = await makeRequest(`${APP_URL}/api/clearance/my-status`, "GET", {
      "Authorization": `Bearer ${studentToken}`
    });

    assert(statusRes.status === 200, `Fetching clearance status returned status 200 (got ${statusRes.status})`);
    assert(statusRes.body.clearanceRequests?.length === 6, `Found 6 clearance requests (got ${statusRes.body.clearanceRequests?.length})`);
    
    if (statusRes.body.clearanceRequests) {
      const allNotSubmitted = statusRes.body.clearanceRequests.every(r => r.status === "NOT_SUBMITTED");
      assert(allNotSubmitted, "All clearance requests are initially in 'NOT_SUBMITTED' status");
    }

    // Test 5: Admin Login
    console.log("\nTest 5: Logging in Admin...");
    const adminLoginRes = await makeRequest(`${APP_URL}/api/auth/login`, "POST", {}, {
      email: "admin@fupre.edu.ng",
      password: "adminpassword"
    });

    assert(adminLoginRes.status === 200, `Admin login returned status 200 (got ${adminLoginRes.status})`);
    assert(adminLoginRes.body.user?.role === "ADMIN", `User role is 'ADMIN' (got '${adminLoginRes.body.user?.role}')`);

    const adminToken = adminLoginRes.body.accessToken;

    // Test 6: Admin List Students
    console.log("\nTest 6: Admin listing students...");
    const studentsRes = await makeRequest(`${APP_URL}/api/admin/students`, "GET", {
      "Authorization": `Bearer ${adminToken}`
    });

    assert(studentsRes.status === 200, `Admin list students returned status 200 (got ${studentsRes.status})`);
    assert(studentsRes.body.students?.length > 0, "Student list contains at least 1 student");
    
    if (studentsRes.body.students) {
      const foundTestStudent = studentsRes.body.students.some(s => s.user?.email === "student@fupre.edu.ng");
      assert(foundTestStudent, "Admin list includes our seeded student 'student@fupre.edu.ng'");
    }

    // Final Report
    console.log("\n==========================================");
    console.log("VERIFICATION TEST REPORT SUMMARY");
    console.log(`PASSED: ${testPassed}`);
    console.log(`FAILED: ${testFailed}`);
    console.log("==========================================\n");

    process.exit(testFailed === 0 ? 0 : 1);

  } catch (error) {
    console.error("Test execution encountered an error:", error);
    process.exit(1);
  }
}

runTests();
