# Question Pattern Library

Reusable question patterns organized by measurement objective. All example question text is in **Vietnamese** — these are output templates to copy and adapt to the specific research context. Instructional annotations (like question type, routing, and coding notes) are in English for clarity.

---

## Pattern 1: Awareness Funnel

*Use for: Brand awareness, feature awareness, campaign awareness*

> **Q[n]. [UNAIDED]** Khi nhắc đến [danh mục], bạn nghĩ đến [thương hiệu/tính năng/chương trình] nào đầu tiên?
[OPEN-END]
→ Code: Top-of-mind awareness
> 

> **Q[n+1]. [UNAIDED]** Ngoài ra, bạn còn biết đến [thương hiệu/tính năng/chương trình] nào khác?
[OPEN-END]
→ Code: Spontaneous awareness
> 

> **Q[n+2]. [AIDED]** Trong danh sách sau, bạn đã từng nghe nói về [thương hiệu/tính năng/chương trình] nào?
[MULTI-SELECT, RANDOMIZE]
1. [Option A]
2. [Option B]
...
N. Không biết cái nào trong danh sách trên
> 

**Key rules:** Always place unaided before aided. Unaided questions must be open-end. Aided list should include an anchor option for "none of the above."

---

## Pattern 2: Source of Awareness (SOA)

*Use for: Tracking where awareness comes from, touchpoint attribution*

> **Q[n].** Bạn biết đến [đối tượng] từ đâu?
[MULTI-SELECT, RANDOMIZE options 1-N]
**--- In-app touchpoints ---**
1. Thông báo đẩy (push notification) từ MoMo
2. Banner / Pop-up trong app MoMo
3. Game / nhiệm vụ trong MoMo
**--- Out-app digital ---**
4. Quảng cáo trên mạng xã hội (Facebook, TikTok, YouTube, Instagram...)
5. Quảng cáo trên trang web / ứng dụng khác
6. Email marketing
**--- Traditional media ---**
7. Quảng cáo trên TV
8. Quảng cáo trên báo / tạp chí
9. Biển quảng cáo ngoài trời (OOH)
**--- PR & WOM ---**
10. Bài viết / tin tức trên báo
11. KOL / Influencer giới thiệu
12. Bạn bè / người thân giới thiệu
13. Đồng nghiệp giới thiệu
**--- Other ---**
14. Nhìn thấy người khác sử dụng
15. Khác (vui lòng ghi rõ): ________
16. Không nhớ
> 

**Key rules:** Group touchpoints by channel category. Randomize within groups but keep groups in logical order. Always include "Khác" and "Không nhớ" as non-randomized anchors.

---

## Pattern 3: Product Funnel (Awareness → Trial → Usage → Advocacy)

*Use for: Product adoption, feature adoption, conversion funnel measurement*

> **Q[n].** Bạn có biết đến [tính năng/sản phẩm] không?
1. Có → Continue
2. Không → SKIP to [next section]
> 

> **Q[n+1].** Bạn đã từng sử dụng [tính năng/sản phẩm] chưa?
1. Đã sử dụng → Continue
2. Chưa từng sử dụng → Q[n+3] (Barriers)
> 

> **Q[n+2].** Trong [khoảng thời gian], bạn sử dụng [tính năng/sản phẩm] bao nhiêu lần?
1. Hàng ngày
2. Vài lần / tuần
3. 1 lần / tuần
4. Vài lần / tháng
5. 1 lần / tháng hoặc ít hơn
6. Đã ngừng sử dụng → Q[n+4] (Churn reasons)
> 

> **Q[n+3]. [FOR NON-USERS]** Lý do nào khiến bạn chưa sử dụng [tính năng/sản phẩm]?
[MULTI-SELECT, RANDOMIZE options 1-N]
1. Không biết cách sử dụng
2. Không thấy cần thiết
3. Đã có giải pháp khác
4. Lo ngại về bảo mật
5. Giao diện khó hiểu
6. Khác (vui lòng ghi rõ): ________
> 

**Key rules:** Each funnel stage filters to the next. Use specific timeframes for frequency (not vague terms). Non-user barrier questions should be multi-select with randomization. Route churned users to a separate churn reason question.

---

## Pattern 4: Satisfaction Battery

*Use for: CSAT, NPS, touchpoint satisfaction*

> **Q[n].** Nhìn chung, bạn hài lòng như thế nào với [đối tượng]?
1. Rất không hài lòng
2. Không hài lòng
3. Bình thường
4. Hài lòng
5. Rất hài lòng
> 

> **Q[n+1]. [NPS]** Trên thang điểm từ 0 đến 10, bạn sẵn lòng giới thiệu [đối tượng] cho bạn bè/người thân ở mức nào? (0 = Hoàn toàn không sẵn lòng, 10 = Rất sẵn lòng)
[SCALE 0-10]
> 

> **Q[n+2]. [OPEN-END]** Tại sao bạn cho điểm như vậy?
> 

**Key rules:** Place overall satisfaction before specific touchpoints. NPS must use the standard 0-10 scale — do not modify. Always follow a rating question with an open-end "why" question for diagnostic insight.

---

## Pattern 5: Attribute Evaluation (Matrix/Grid)

*Use for: Asset evaluation, concept testing, feature assessment*

> **Q[n].** Bạn đánh giá [đối tượng] như thế nào theo các tiêu chí sau đây?
[MATRIX, RANDOMIZE rows, SINGLE SELECT per row]
> 

|  | Rất không đồng ý | Không đồng ý | Bình thường | Đồng ý | Rất đồng ý |
| --- | --- | --- | --- | --- | --- |
| Thông điệp rõ ràng, dễ hiểu |  |  |  |  |  |
| Nội dung hấp dẫn, thu hút |  |  |  |  |  |
| Liên quan đến tôi |  |  |  |  |  |
| Khác biệt, độc đáo |  |  |  |  |  |
| Khiến tôi muốn tìm hiểu thêm |  |  |  |  |  |
| Khiến tôi muốn sử dụng |  |  |  |  |  |

**Key rules:** Limit to 7-10 attribute rows per matrix to prevent respondent fatigue. Randomize row order. Use consistent 5-point Likert scale across all matrices in the same instrument. Adapt attribute statements to match the specific research context.

---

## Pattern 6: Importance-Performance Analysis (IPA)

*Use for: Driver analysis, gap analysis, prioritization*

> **Q[n].** Khi sử dụng [dịch vụ/sản phẩm], các yếu tố sau quan trọng với bạn ở mức nào?
[MATRIX, SINGLE SELECT per row]
Scale: 1=Hoàn toàn không quan trọng → 5=Rất quan trọng
> 

> **Q[n+1].** Bạn đánh giá [dịch vụ/sản phẩm] đang thực hiện các yếu tố sau ở mức nào?
[MATRIX, SINGLE SELECT per row, SAME ITEMS as Q[n]]
Scale: 1=Rất kém → 5=Rất tốt
> 

**Key rules:** Both matrices must use the exact same attribute list. Present importance first, then performance. Use the same number of scale points for both (typically 5). The gap (Importance minus Performance) identifies priority areas.

---

## Pattern 7: Behavioral Recall (For Qual)

*Use for: Journey mapping, experience reconstruction in IDI/FGD*

> **Main question:**
"Hãy kể cho tôi về lần gần nhất bạn [hành vi cụ thể]. Chuyện gì đã xảy ra?"
> 
- **[Probe — Context]:** "Lúc đó bạn đang ở đâu? Đang làm gì?"
- **[Probe — Actions]:** "Bạn đã làm gì đầu tiên? Sau đó thì sao?"
- **[Probe — Emotions]:** "Bạn cảm thấy thế nào lúc đó?"
- **[Probe — Pain points]:** "Có điều gì khó khăn hoặc bất tiện không?"
- **[Probe — Comparison]:** "So với [đối thủ/cách khác], trải nghiệm này khác gì?"
- **[Probe — Improvement]:** "Nếu được thay đổi 1 điều, bạn sẽ thay đổi gì?"

**Key rules:** Let the participant tell the story naturally before probing. Start with context, move to actions, then emotions, then evaluation. Use the probes flexibly — not every probe is needed for every participant.

---

## Pattern 8: Concept/Stimulus Testing

*Use for: Ad testing, concept testing, feature concept evaluation*

> [SHOW STIMULUS]
[Moderator/system: Show respondent [stimulus] for [X] seconds]
> 

> **Q[n]. [FIRST REACTION - OPEN-END]** Sau khi xem, ấn tượng đầu tiên của bạn là gì?
> 

> **Q[n+1]. [OVERALL LIKING]** Nhìn chung, bạn thích [stimulus] ở mức nào?
1. Rất không thích
2. Không thích
3. Bình thường
4. Thích
5. Rất thích
> 

> **Q[n+2].** [ATTRIBUTE BATTERY — see Pattern 5]
> 

> **Q[n+3]. [OPEN-END]** Điều gì bạn thích nhất?
> 

> **Q[n+4]. [OPEN-END]** Điều gì bạn không thích hoặc muốn thay đổi?
> 

> **Q[n+5]. [INTENT]** Sau khi xem, bạn có muốn sử dụng/mua/tìm hiểu thêm không?
[SINGLE SELECT — 5-point intent scale]
> 

**Key rules:** Always capture first reaction (open-end) before any structured rating — structured questions anchor thinking. Follow the sequence: open reaction → overall liking → attribute evaluation → likes/dislikes → intent. For multiple stimuli, use monadic or sequential monadic design with rotation.