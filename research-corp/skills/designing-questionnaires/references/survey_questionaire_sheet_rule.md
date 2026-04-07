# Survey Questionnaire Sheet Rules (IRIS)

This document describes the **English formatting rules** for the IRIS **SURVEY DETAIL** sheet.  
Follow the structure shown in **TTT_questionnaire_IRIS.xlsx**:
- **Sheet 2 (HDSD):** Example + usage guidance
- **Sheet 3 (SURVEY DETAIL):** Required output format

## 1) Global Rules (Do Not Break)
- **Do not change sheet names.**
- **Do not add/remove columns** in `SURVEY DETAIL`.
- **Plain text only** (no colors, fonts, hyperlinks, or images).
- **No empty rows between questions** (blank rows can break parsing).
- **Final output must contain only `SURVEY DETAIL`** (remove `HDSD`, `TEMPLATE`).
- **Survey Objective block is required** (rows 1–4 in the template).
- **PAGENAME starts at row 6** and must not be duplicated.

## 2) Question Types (IRIS Codes)
- **SINGLE_ANSWER**: single choice
- **MULTIPLE_ANSWER**: multi-select
- **OPEN_ENDED**:
  - `Text`: free text
  - `Phone`: phone number
  - `Email`: email
  - `Number`: numeric
- **DROPDOWN**: single choice dropdown
- **DROPDOWN_LIST**: single choice dropdown (list style)
- **DRAGGING**:
  - `1-5`: rating 1–5
  - `1-7`: rating 1–7
  - `0-10`: rating 0–10
- **RADIO_BTN_GRID**: single choice per row
- **CHECKBOXES_GRID**: multi-select per row
- **MAX_DIFF**: best/worst selection
- **PIPING LOGIC**: re-use prior answers in later options

**Special options (Column D):**
- Use `other`, `none`, or `all` in **Column D** for special options:
  - “Other (specify)” → `other`
  - “None of the above” → `none`
  - “All of the above” → `all`

## 3) Output Format (Sheet 3: SURVEY DETAIL)
Follow this block structure exactly. All content is **row-based** (no merged columns).

### 3.1 Survey Objective Section (Top of Sheet)
Use the fixed labels in **Column B**:
- `Context / Background`
- `Survey Objectives`
- `Target Audience`

The example in **Sheet 2** shows the exact layout:
- Column A contains the section title (`SURVEY OBJECTIVE`).
- Column B contains the label.
- Column C contains the text content.

### 3.2 Page Header
Each page begins with:
- **Column A:** `PAGENAME: <PAGE NAME>`
- Columns B–D left blank

### 3.3 Question Block Structure
Each question is written as a **compact block**:

1. **Question line**
   - Column A: `Question ID` (e.g., `Q1`, `S3`, `A1`)
   - Column B: `Nội dung câu hỏi`
   - Column C: question text

2. **Question type**
   - Column B: `Loại câu`
   - Column C: question type code (e.g., `SINGLE_ANSWER`)

3. **Instruction**
   - Column B: `Hướng dẫn trả lời`
   - Column C: instruction text

4. **Options header**
   - Column B: `Code`
   - Column C: `Option`

5. **Options list**
   - Column B: numeric code (1, 2, 3, ...)
   - Column C: option text
   - Column D: special code (`other`, `none`, `all`) if applicable

### 3.4 OPEN_ENDED Block
If `OPEN_ENDED`, use:
- Question line (as above)
- Question type line
- **Data type line**
  - Column B: `Dạng`
  - Column C: `Text` / `Phone` / `Email` / `Number`
- **Instruction line**
  - Column B: `Hướng dẫn trả lời`
  - Column C: `Điền câu trả lời vào ô trống`

## 4) Workflow
1. Download the template.
2. Open **SURVEY DETAIL**.
3. Fill data using the format above.
4. Validate:
   - No blank rows between questions
   - All question type codes match Section 2
   - Special options use Column D correctly
5. Save as `.xlsx` without changing names or columns.
