AL OMRAN STEP COURSE — STUDENT NAMES & CENTRAL PRE-COURSE REPORTS

WHAT THIS UPDATE DOES
- Requires each student to enter a full name before starting Chapter 1.
- Records the student's name, score, percentage, and timestamp.
- Stores every answer, selected choice, correct choice, result (correct/wrong/unanswered),
  and feedback explanation for all 70 questions.
- Adds a Teacher > Pre-Course Test Reports page.
- Allows the teacher to review all submissions, expand every student's full 70-answer
  report, and download a detailed CSV.

IMPORTANT ABOUT MULTI-DEVICE REPORTING
GitHub Pages is a static hosting service and does not combine local browser records.
To collect all students' results from separate phones/computers, set up the included
Google Apps Script backend. It writes submissions to one Google Sheet.

SET UP THE SHARED GOOGLE SHEET
1. Open https://script.google.com/ and create a new project.
2. Open the included STEP_Reports_Backend.gs file and copy all its contents into Code.gs.
3. At the top, replace CHANGE_THIS_TO_A_PRIVATE_PIN with your own private teacher PIN.
4. Save the project.
5. Select setupStepReports from the function list and click Run.
6. Approve the Google permissions. The script log gives you the new Google Sheet URL.
7. Click Deploy > New deployment > select Web app.
8. Set "Execute as" to Me.
9. Set "Who has access" to Anyone.
10. Deploy and copy the Web App URL ending in /exec.

CONNECT IT TO THE PLATFORM
1. Open the platform and switch the view to Teacher.
2. Click Pre-Course Test Reports in the left menu.
3. Paste the Web App URL and the private teacher PIN.
4. Click Save connection.
5. Click Create student test link and copy the generated link.
6. Share that student link with the class. It includes the reporting endpoint but not
   the teacher PIN.
7. Students open the shared link, enter their names, and complete the test.
8. Return to Teacher > Pre-Course Test Reports and click Refresh reports.

REPORT CONTENT
The report includes student name, submitted date/time, score out of 70, percentage,
number correct, number wrong, number unanswered, and a detailed 70-question review.
The detailed CSV has one row per question per test attempt.

LOCAL FALLBACK
If no shared backend URL is configured, a submission is saved only in that student's
current browser. It will NOT appear on the teacher's device. For class-wide results,
complete the Google Apps Script setup above.

PUBLISH THE UPDATED PLATFORM
Replace the root index.html in your GitHub Pages repository with the index.html from
this package and commit the change. All illustrations are embedded; no assets folder
is required. Refresh with Ctrl+F5.
