/** Plausible alternatives within the same interaction; the stated intention makes
 * the instructional choice unambiguous. Open output may express any valid idea. */
export const outputScaffolds: Record<string, { intent: string; alternatives: [string, string] }> =
  Object.fromEntries(
    (
      [
        [
          'leave-home',
          '你还没准备好，需要再争取一点时间。',
          'I am ready to leave now.',
          'I left earlier than usual today.',
        ],
        [
          'station',
          '你想确认去市中心的票价。',
          'Which platform should I use?',
          'Where is the nearest exit?',
        ],
        [
          'train',
          '你要在下一站下车，并告诉对方。',
          'Yes, this is my stop.',
          'I am staying on until the final stop.',
        ],
        [
          'office-arrival',
          '你来参加团队会议，说明来意。',
          'I am here to collect a delivery.',
          'I am waiting for a job interview.',
        ],
        [
          'commute-chat',
          '今天车厢很拥挤，但你准时到达，表达这两个事实。',
          'The train was quiet, and I arrived early.',
          'The train was crowded, so I arrived late.',
        ],
        [
          'shopping-list',
          '你要找大米，向工作人员问位置。',
          'Do you have a smaller bag?',
          'Is this rice on sale?',
        ],
        [
          'produce',
          '你不知道怎样使用称重秤，请对方演示。',
          'Could you weigh this for me?',
          'Is the price per bag or per pound?',
        ],
        [
          'labels',
          '本轮你需要不含乳制品的选择，说明这一需求。',
          'I need a gluten-free option.',
          'I am looking for a low-sugar option.',
        ],
        [
          'substitute',
          '想买的商品缺货，询问有没有类似替代品。',
          'When will it be back in stock?',
          'Can I order the same item online?',
        ],
        ['checkout', '你希望拿到收据，简短确认。', 'No, thank you.', 'Could you email it instead?'],
        [
          'table',
          '本轮同行两个人，回答人数。',
          'We are waiting for one more person.',
          'We booked a table for four.',
        ],
        [
          'menu',
          '你想让服务员推荐主菜。',
          'Could you explain this side dish?',
          'What drinks would you recommend?',
        ],
        [
          'diet',
          '虚构练习角色有花生过敏，需要明确告知。',
          'I prefer a vegetarian meal.',
          'I do not like spicy food.',
        ],
        [
          'meal-problem',
          '端上来的菜与你点的不同，礼貌说明差异。',
          'Could this be warmed up, please?',
          'Could we have another plate?',
        ],
        [
          'bill',
          '你们希望分开付款，说明付款方式。',
          'We will pay together.',
          'One person will cover the whole bill.',
        ],
        [
          'flight-check-in',
          '本轮你有一件行李需要托运，回答数量。',
          'I only have a carry-on bag.',
          'I have two bags to check.',
        ],
        [
          'security',
          '你不确定是否需要取出电脑，询问当前要求。',
          'Where should I put my shoes?',
          'Do I need to remove my jacket?',
        ],
        [
          'gate',
          '登机口发生变化，你要找最新信息的确认渠道。',
          'Could you point me to the old gate?',
          'Is there a place to charge my phone?',
        ],
        [
          'boarding',
          '有人坐在你票面对应的座位上，先礼貌提出核对。',
          'Could I move to an aisle seat?',
          'Could you help me store my bag?',
        ],
        [
          'arrival',
          '你的托运行李还没到，说明当前问题。',
          'My bag was damaged on arrival.',
          'I left my bag on the plane.',
        ],
        [
          'hotel-arrival',
          '刚到酒店，你希望办理入住。',
          'I would like to check out.',
          'I would like to extend my stay.',
        ],
        [
          'hotel-room',
          '你想确认房间所在楼层。',
          'Where is the elevator?',
          'What time is breakfast served?',
        ],
        [
          'hotel-facilities',
          '你需要额外的毛巾，提出物品请求。',
          'Could I have another room key?',
          'Could someone clean the room?',
        ],
        [
          'room-issue',
          '房间空调无法运转，说明这个具体问题。',
          'The room is colder than I expected.',
          'The air conditioning is too loud.',
        ],
        [
          'hotel-checkout',
          '账单上有一项你不理解的费用，先询问原因。',
          'Could I have a printed receipt?',
          'Could I pay with a different card?',
        ],
        [
          'appointment',
          '虚构角色还没有预约，现在要申请预约。',
          'I have an appointment at ten.',
          'I need to cancel my appointment.',
        ],
        [
          'symptoms',
          '虚构角色从昨天起一直头疼，说明症状与起始时间。',
          'My headache started this morning.',
          'I had a headache last week, but it has gone.',
        ],
        [
          'medical-history',
          '本轮虚构角色目前没有服药，回答这一事实。',
          'I take medication every morning.',
          'I stopped taking it last month.',
        ],
        [
          'clarification',
          '你没听清，希望对方放慢速度再说一次。',
          'Could you write down the next step?',
          'I understand the instructions now.',
        ],
        [
          'follow-up',
          '离开前你想确认如何收到检查结果。',
          'When should I book the next appointment?',
          'Where can I pay for the visit?',
        ],
        [
          'office-plan',
          '任务很多，你想确认先处理哪件事。',
          'Who should I send the finished report to?',
          'Which folder should I use for the files?',
        ],
        [
          'office-clarify',
          '你不确定任务范围是否包含测试，询问范围。',
          'Who is responsible for testing?',
          'When should the testing phase finish?',
        ],
        [
          'office-meeting',
          '你对方案的时间安排有担忧，提出这个关注点。',
          'I have a concern about the budget.',
          'I am comfortable with the current timeline.',
        ],
        [
          'office-update',
          '你需要同事协助核对数据，提出具体请求。',
          'Could you help me arrange the meeting?',
          'Could you send me the presentation slides?',
        ],
        [
          'office-handoff',
          '你承诺明天跟进，说明下一步时间。',
          'I will wait until next week.',
          'I followed up yesterday.',
        ],
      ] as [string, string, string, string][]
    ).map(([id, intent, a, b]) => [id, { intent, alternatives: [a, b] }]),
  );
