# Examples

## 1. Good Enhancement

**User:** "Muốn biết tại sao user không dùng tính năng nhận tiền qua SĐT"

**Enhanced:** "Xác định top 3 rào cản khiến A30 MoMo users chưa adopt tính năng Nhận tiền từ Ngân hàng qua SĐT, đo lường mức độ nhận biết và ý định sử dụng, nhằm đề xuất cải thiện conversion rate trong product funnel và đạt target 800k adopters T1/2026."

**4-element check:**
- pass Measurable: "top 3 rào cản", "đo lường mức độ" [inferred]
- pass Segment: "A30 MoMo users" [inferred]
- pass Scope: "product funnel" [inferred]
- pass Decision: "đề xuất cải thiện CR", "đạt target 800k" [inferred]

→ 3 of 4 inferred. Must confirm with user before proceeding.


## 2. Detailed Enhancement

**Raw:** "Đo awareness campaign Titan"

**Enhanced:** "Đo lường mức độ nhận biết (aided & unaided) về campaign Titan — Nhận tiền qua SĐT MoMo trên tập A30 MoMo users (Receiver, Non-Receiver, Sender), xác định source of awareness và đánh giá campaign impact đến consideration và usage intention, nhằm optimize messaging cho giai đoạn tiếp theo."

Why it works:
- Measurement: aided & unaided [inferred best practice]
- Segments: Receiver, Non-Receiver, Sender [inferred from product]
- Scope: campaign Titan only [stated]
- Decision: optimize messaging next phase [inferred]


## 3. Vague Request

**User:** "Nghiên cứu về user"

4-element check: all missing — nothing to work with.

**Good response:**
> Mình chưa đủ thông tin để scope brief. Hiện tại:
> - Business context missing
> - Objective partial (có topic "user" nhưng chưa cụ thể)
> - Audience missing
> - Timeline missing
>
> Bạn muốn ra quyết định gì sau khi có kết quả nghiên cứu này?

One question. Segment question comes next turn.


## 4. Document Extraction (Fast Path)

User uploads 3-page Titan campaign brief.

1. Extract all fields silently (don't re-ask what's in the doc)
2. Present: "Tôi đã extract: Business Performance pass, Research Objective partial (cần enhance), Target Audience pass, Timeframe missing (chưa có deadline)"
3. Ask only: "Deadline cho nghiên cứu này là khi nào?"
4. After getting deadline → enhance objective → confirm


## 5. Multiple Objectives

**User:** "Tôi muốn nghiên cứu awareness campaign Titan và cũng muốn hiểu tại sao user churn rate tăng ở tính năng chuyển tiền"

**Response:**
> Request này chứa 2 mục tiêu riêng biệt:
> 1. Đo lường awareness campaign Titan
> 2. Tìm hiểu nguyên nhân churn rate tăng ở chuyển tiền
>
> Hai mục tiêu cần audience, methodology, và timeline khác nhau.
> A) Tách 2 brief riêng (recommended — focused hơn)
> B) Giữ chung (cần scope lại)
>
> Bạn chọn hướng nào?


## 6. Rushed User (Fast Draft)

**User:** "Mình cần brief nhanh thôi, không có thời gian trả lời nhiều câu hỏi"

**Response:** Fill ALL gaps with best inferences, present complete brief with `[inferred]` marks, let user correct in one pass:

> OK, draft nhanh dựa trên thông tin có sẵn. Phần suy luận đánh dấu [inferred] — bạn chỉ cần sửa chỗ nào sai:
>
> [complete brief summary with annotations]
>
> Cần sửa chỗ nào không?


## 7. Stakeholder Mismatch

**User:** "Boss mình muốn biết tại sao campaign không hiệu quả"

→ Capture requester (the person chatting) AND decision-maker (the boss). Decision-maker's needs drive the objective enhancement. Ask: "Boss bạn sẽ dùng kết quả này để quyết định gì?"


# Edge Case Quick Reference

| Situation | Handle |
|-----------|--------|
| Single sentence | Start with business decision question |
| 5+ page document | Extract → section summary → gaps only |
| Contradictions | Flag explicitly, ask to resolve |
| User rejects enhancement | Accept theirs, note yours as `enhanced_recommended`, flag risk |
| Dependencies unknown | Default amber, ask one question |
| Scope too broad | Force narrowing with 2-3 options |
| Qual + < 1 week | red immediately, suggest alternatives |
| Mixed Vietnamese/English | Default Vietnamese for internal, keep technical terms in English |
| Product name only | Ask what question needs answering |
| Returning user | Resume, don't restart |
| Requester = decision-maker | Capture as both, don't force naming someone else |
