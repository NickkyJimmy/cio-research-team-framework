# Examples

Concrete examples of screeners, traceability matrices, good/bad questions, and discussion guide sections. All respondent-facing question text is in **Vietnamese** (as it would appear in the actual instrument). Explanations and annotations are in English.

---

## Example: Screener

A typical screener for MoMo users with age screening, industry exclusion, and behavioral segmentation.

> **S1.** Bạn bao nhiêu tuổi?
1. Dưới 18 → [KẾT THÚC]
2. 18-24
3. 25-34
4. 35-45
5. Trên 45 → [KẾT THÚC]
> 

> **S2.** Bạn hoặc người thân trong gia đình có đang làm việc trong các lĩnh vực sau không? [ĐA CHỌN]
1. Nghiên cứu thị trường → [KẾT THÚC]
2. Quảng cáo / Marketing → [KẾT THÚC]
3. Dịch vụ tài chính / Fintech → [KẾT THÚC]
4. Không làm trong các lĩnh vực trên → Tiếp tục
> 

> **S3.** Trong 30 ngày qua, bạn có sử dụng ứng dụng MoMo không?
1. Có → Tiếp tục
2. Không → [KẾT THÚC]
> 

> **S4.** Trong 30 ngày qua, bạn có nhận tiền từ người khác qua MoMo không?
1. Có → Segment: A30 Receiver
2. Không → S5
> 

> **S5.** Trong 30 ngày qua, bạn có nạp tiền vào MoMo từ ngân hàng liên kết không?
1. Có → Segment: A30 Cash-in
2. Không → Segment: A30 Non-Receiver
> 

**What makes this screener effective:** Uses specific 30-day timeframe (not vague "recently"). Behavioral criteria for segmentation (not self-classification). Clear routing at every decision point. Industry exclusion placed early to save respondent time.

---

## Example: Traceability Matrix

Shows how content framework elements map to specific questionnaire items.

| Objective | Sub-obj | Content Block | Measure | Dimension | Indicator | Q# | Type | Scale | Analysis |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| O1: Awareness | O1.1 | Block A: Awareness | Awareness | Unaided | Top-of-mind | Q1 | OE | — | Coding → % |
| O1 | O1.1 | Block A | Awareness | Aided | Recognition | Q2 | MS | Y/N list | % |
| O1 | O1.2 | Block A | SOA | Touchpoints | Channel mix | Q3 | MS | Channel list | % per channel |
| O2: Satisfaction | O2.1: CSAT | Block B: Satisfaction | CSAT | Overall | Score | Q5 | SS | 1-5 | Mean, T2B |
| O2 | O2.2: NPS | Block B | NPS | Recommend | Score | Q6 | SC | 0-10 | NPS formula |

**What makes this matrix effective:** Every content block traces to at least one question. Analysis method is specified upfront so scale design is correct. Abbreviations are consistent (OE, SS, MS, SC, MT, RK).

---

## Example: Good Survey Question ✅

> **Q7.** Bạn biết đến tính năng "Nhận tiền từ Ngân hàng qua SĐT MoMo" từ đâu?
[ĐA CHỌN, NGẪU NHIÊN HÓA phương án 1-8]
*Ánh xạ: Content Block A → SOA → Touchpoints*
1. Thông báo trong app MoMo
2. Quảng cáo trên mạng xã hội
3. Quảng cáo trên TV / báo chí
4. Bạn bè / người thân giới thiệu
5. Nhìn thấy khi sử dụng app ngân hàng
6. PR / bài viết trên báo
7. Game / nhiệm vụ trong MoMo
8. Pop-up / banner trong MoMo
9. Khác (vui lòng ghi rõ): ________
10. Không nhớ / Không biết
> 

<aside>
✅

**Why this question is good:** Multi-select allows multiple touchpoints. Options are comprehensive (in-app + out-app + WOM). Randomized to prevent order bias. Includes "Khác" and "Không nhớ" as non-randomized anchors. Maps directly to SOA content block.

</aside>

---

## Example: Bad Survey Question ❌

> ❌ *"Bạn có thấy tính năng nhận tiền qua SĐT MoMo rất tiện lợi và dễ sử dụng không?"*
> 

<aside>
⚠️

**Problems:** Leading (assumes "rất tiện lợi"), double-barreled ("tiện lợi" AND "dễ sử dụng"), Yes/No format loses nuance.

</aside>

**How to fix:** Split into two separate Likert-scale questions — one for convenience, one for ease of use. Remove evaluative language.

---

## Example: Discussion Guide Section

Shows a qualitative discussion section with main question, probes, and moderator notes — all in Vietnamese as it would appear in the actual guide.

> **Phần 3: Hành trình nhận tiền (Journey Reconstruction)**
Thời lượng: 15–20 phút | Mục tiêu: Content Block B — Product Funnel
> 

> **Câu hỏi chính:**
"Hãy kể cho tôi về lần gần nhất bạn nhận tiền từ người khác. Chuyện gì đã xảy ra từ đầu đến cuối?"
> 
- [Probe]: "Ai gửi tiền cho bạn? Trong hoàn cảnh nào?"
- [Probe]: "Bạn đã hướng dẫn người gửi như thế nào?"
- [Probe]: "Có khó khăn gì không? Điều gì khiến bạn thấy phiền nhất?"
- [Probe]: "So với nhận tiền qua ngân hàng thì sao?"

> **Follow-up:** "Nếu bạn có thể thay đổi một điều trong quá trình nhận tiền, bạn sẽ thay đổi gì?"
> 

<aside>
📌

**Moderator note:** Let the participant tell the story naturally before probing. Observe both verbal and non-verbal reactions. If participant says "bình thường" (normal/fine), probe deeper — this often masks unexpressed frustration or indifference.

</aside>