# Attendly — AI-enabled attendance project prototype

A small browser-based prototype for exploring the CBSE AI Project Cycle through a classroom attendance workflow. It provides a student register, date-based attendance marking, summary counts, CSV export, and an optional camera preview.

## Run it

Open `index.html` in a modern browser. To test the optional camera preview, serve the files from `localhost` (for example, `python -m http.server 8000`) and open `http://localhost:8000`. Camera access is optional and requires permission.

## What the prototype does

- Add and remove demo students.
- Mark and undo attendance for a selected date.
- Show the number and percentage marked present.
- Export the selected date's register as a CSV file.
- Save demo roster and attendance in the current browser's local storage.
- Show a live camera preview only after the user opts in; the video is not recorded, uploaded, or analyzed.

## Important scope and ethics

This version intentionally **does not perform face recognition or automatically identify students**. A camera preview is not an AI model and is not used to mark attendance. The prototype uses no face images, face embeddings, or biometric identifiers. Do not enter real student data on shared devices.

Before considering any real deployment—especially in a school—obtain school authorization and informed consent from students and guardians as applicable; provide a non-biometric attendance alternative; minimize collection and retention; protect access and exports; assess bias and error rates across groups; and follow applicable privacy and child-protection rules. A face-recognition system should not be added without a documented necessity, a rigorous impact assessment, human review, and appropriate legal and institutional approval.

## CBSE AI Project Cycle mapping

1. **Problem scoping:** reduce time spent on routine register management while recognizing that a wrong attendance record can affect students.
2. **Data planning:** this demo uses names entered locally by the user; it does not collect face data. In a real study, first identify the minimum data needed and obtain approval and consent.
3. **Conceptualization:** date + student + an explicit attendance action produces a simple register entry. The camera preview is separate from this workflow.
4. **Evaluation:** test date changes, duplicate names, add/remove actions, export, storage behavior, keyboard use, and screen-reader labels. Any future model would require separate accuracy, subgroup fairness, and human-override evaluation.
5. **Ethical use:** prioritize transparency, data minimization, consent, fairness, security, and a manual alternative.

## Files

- `index.html` — accessible page structure.
- `styles.css` — responsive visual design.
- `app.js` — browser-only demo behavior.
