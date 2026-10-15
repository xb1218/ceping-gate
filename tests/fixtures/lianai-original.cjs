
        // 30道场景题 - 考察5个维度
        // 维度: filter(瞎眼滤镜), boundary(底线消失), internal(脑补内耗), sealed(水泥封心), rational(随时抽身)
        
        const questions = [
            // 场景 1：消息回复 - 考察【脑补内耗】
            {
                text: "暧昧对象昨晚聊得火热，今天突然“尸体化”一整天没回消息，但发了朋友圈。你会？",
                options: [
                    { text: "A. 视奸TA的朋友圈800遍，连标点符号都在做阅读理解，“他是不是讨厌我了？”", score: 10, dimension: "internal" },
                    { text: "B. “没回就没回呗”，该干嘛干嘛，甚至没发现他没回。", score: 2, dimension: "rational" },
                    { text: "C. 既然你不回我，那我也不回你！立刻把TA设为免打扰，生闷气。", score: 7, dimension: "sealed" },
                    { text: "D. 疯狂轰炸表情包，或者直接发问号，“你为什么不理我？在忙吗？”", score: 10, dimension: "boundary" }
                ]
            },
            // 场景 2：前任痕迹 - 考察【脑补内耗】
            {
                text: "在TA的手机相册里，无意间翻到了一张TA和前任的合照（很久以前的），你会？",
                options: [
                    { text: "A. 天塌了！立刻脑补“他还爱着她”，哭着质问“你是不是把我也当替身？”", score: 10, dimension: "internal" },
                    { text: "B. 谁还没个过去啊，只要现在对我好就行，假装没看见。", score: 2, dimension: "rational" },
                    { text: "C. 表面装大度，背地里偷偷去搜前任的微博/小红书，进行全方位比美。", score: 7, dimension: "internal" },
                    { text: "D. “这前任长得也不咋地嘛”，内心毫无波澜，甚至有点想笑。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 3：被拒绝 - 考察【底线消失】
            {
                text: "周末你想约TA出来，TA冷淡地说“这周我想一个人静静”，你会？",
                options: [
                    { text: "A. “是不是我哪里做得不好？”带着爱心便当直接杀到TA家楼下求见面。", score: 10, dimension: "boundary" },
                    { text: "B. “好呀，刚好我也想宅家追剧”，互不打扰挺好的。", score: 2, dimension: "rational" },
                    { text: "C. 觉得被拒绝很没面子，故意发朋友圈展示自己玩得很嗨，气死TA。", score: 7, dimension: "internal" },
                    { text: "D. 太棒了！终于不用化妆洗头了，立刻点个外卖打游戏。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 4：吵架冷战 - 考察【底线消失】
            {
                text: "你们因为一件小事吵架了，TA摔门而出，两小时没联系你，你会？",
                options: [
                    { text: "A. 恐慌发作，疯狂打电话发微信道歉（哪怕不是你的错），求TA回来。", score: 10, dimension: "boundary" },
                    { text: "B. 给双方一点冷静时间，晚点再发个消息理性沟通解决问题。", score: 2, dimension: "rational" },
                    { text: "C. “滚就滚，谁稀罕！”把TA拉黑删除，然后一个人躲被子里哭。", score: 7, dimension: "internal" },
                    { text: "D. 终于清静了，该干嘛干嘛，甚至觉得这种状态比吵架舒服多了。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 5：异性边界 - 考察【瞎眼滤镜】
            {
                text: "发现TA给别的异性朋友圈点赞，或者回复评论有点暧昧，你会？",
                options: [
                    { text: "A. 视奸那个异性的所有社交账号，把TA祖宗十八代都查出来，然后跟对象大闹。", score: 10, dimension: "internal" },
                    { text: "B. 如果只是点赞无所谓，如果真的过界了，直接问TA什么意思，不行就分。", score: 2, dimension: "rational" },
                    { text: "C. 既然你聊骚，那我也聊！立刻打开社交软件滑几个帅哥/美女。", score: 7, dimension: "boundary" },
                    { text: "D. “他肯定只是手滑或者礼貌回复，我相信他不是那种人。”自动帮他找借口。", score: 10, dimension: "filter" }
                ]
            },
            // 场景 6：承诺恐惧 - 考察【水泥封心】
            {
                text: "TA突然很认真地跟你聊未来规划（结婚/买房），你的第一反应是？",
                options: [
                    { text: "A. 感动得痛哭流涕，恨不得明天就领证，连孩子名字都想好了。", score: 10, dimension: "filter" },
                    { text: "B. 认真听取TA的想法，结合实际情况讨论可行性，一步步来。", score: 2, dimension: "rational" },
                    { text: "C. 既期待又害怕，觉得“我不配”或者“肯定会搞砸”，想转移话题。", score: 7, dimension: "internal" },
                    { text: "D. 浑身起鸡皮疙瘩，觉得压力山大，想找个借口逃跑或分手。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 7：生病依赖 - 考察【脑补内耗】
            {
                text: "你生病了，很不舒服，TA说在加班赶不过来，你会？",
                options: [
                    { text: "A. “工作比我重要吗？”哭着指责TA冷血，觉得自己是世界上最可怜的人。", score: 10, dimension: "internal" },
                    { text: "B. 理解工作重要，自己点个外卖吃药，让TA忙完打个电话就好。", score: 2, dimension: "rational" },
                    { text: "C. 嘴上说“没事你去忙”，心里记仇一万年，下次TA生病也不管。", score: 7, dimension: "sealed" },
                    { text: "D. 其实更喜欢一个人待着，TA不来反而不用费力气照顾TA的情绪。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 8：亲密接触 - 考察【底线消失】
            {
                text: "刚确立关系不久，TA想和你进行更亲密的身体接触，你会？",
                options: [
                    { text: "A. 迫不及待，恨不得挂在TA身上，哪怕自己没准备好也硬着头皮上。", score: 10, dimension: "boundary" },
                    { text: "B. 顺其自然，氛围到了就享受，不舒服就直接拒绝。", score: 2, dimension: "rational" },
                    { text: "C. 身体僵硬，内心抗拒但又不敢推开，怕TA不高兴。", score: 7, dimension: "boundary" },
                    { text: "D. 本能地躲开或推开，“别碰我”，觉得恶心或不自在。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 9：金钱付出 - 考察【底线消失】
            {
                text: "TA看中了一个很贵的礼物（超过你预算），暗示你买，你会？",
                options: [
                    { text: "A. 咬咬牙买下来！只要TA开心，我吃泡面都行，甚至借钱买。", score: 10, dimension: "boundary" },
                    { text: "B. 直接说“太贵了买不起”，或者提议一人出一半。", score: 2, dimension: "rational" },
                    { text: "C. 买了又后悔，送的时候还要强调“我很穷的”，生怕TA不回礼。", score: 7, dimension: "internal" },
                    { text: "D. “我也看中了个包，你先送我，我再送你。”", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 10：分手威胁 - 考察【底线消失】
            {
                text: "TA开玩笑说了一句“我们要不还是算了吧”，你会？",
                options: [
                    { text: "A. 瞬间崩溃，下跪/自残/死缠烂打，“求你别离开我，我哪里不好我改”。", score: 10, dimension: "boundary" },
                    { text: "B. 严肃地问TA是认真的还是开玩笑，如果是认真的就尊重决定。", score: 2, dimension: "rational" },
                    { text: "C. “算就算！谁离不开谁啊！”先发制人提分手，然后回家哭死。", score: 7, dimension: "internal" },
                    { text: "D. “哦，好啊。”（内心毫无波澜，甚至已经在想下一顿吃什么）。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 11：分享欲 - 考察【脑补内耗】
            {
                text: "你在路上看到一只很可爱的流浪猫，你的第一反应是？",
                options: [
                    { text: "A. 狂拍10张照片发给TA，TA不回就一直发，甚至打电话让TA看。", score: 10, dimension: "internal" },
                    { text: "B. 拍下来发给TA分享快乐，TA回不回都行，不影响心情。", score: 2, dimension: "rational" },
                    { text: "C. 想发给TA，又怕TA觉得我烦，犹豫半天最后没发。", score: 7, dimension: "internal" },
                    { text: "D. 自己撸一会儿猫，完全想不起来要分享给任何人。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 12：安全感来源 - 考察【底线消失】
            {
                text: "你觉得在一段关系里，什么最能给你安全感？",
                options: [
                    { text: "A. 对方24小时秒回，手机随便看，去哪都报备。", score: 10, dimension: "boundary" },
                    { text: "B. 我们有共同的目标，彼此信任，有各自的独立空间。", score: 2, dimension: "rational" },
                    { text: "C. 对方反复说“我爱你”，不断送礼物证明心意。", score: 7, dimension: "internal" },
                    { text: "D. 只有钱和工作能给我安全感，男人/女人都是靠不住的。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 13：缺点暴露 - 考察【瞎眼滤镜】
            {
                text: "朋友都说TA脾气不好/有点渣，但你觉得？",
                options: [
                    { text: "A. “你们都不懂他，他只对我这样，是因为他太在乎我了。”", score: 10, dimension: "filter" },
                    { text: "B. 认真参考朋友的意见，观察TA是否真的有这些问题。", score: 2, dimension: "rational" },
                    { text: "C. 怀疑朋友是不是嫉妒我们，开始疏远说TA坏话的朋友。", score: 7, dimension: "boundary" },
                    { text: "D. “男人/女人没一个好东西”，反正我也没指望他完美。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 14：纪念日遗忘 - 考察【脑补内耗】
            {
                text: "在一起一周年纪念日，TA竟然完全忘了，你会？",
                options: [
                    { text: "A. 躲在厕所哭了一晚上，觉得“他不爱我了”，等他来哄。", score: 10, dimension: "internal" },
                    { text: "B. 直接提醒他“今天是什么日子”，然后一起去吃顿好的补过。", score: 2, dimension: "rational" },
                    { text: "C. 故意不理他，或者找茬吵架，让他自己反省错哪了。", score: 7, dimension: "internal" },
                    { text: "D. 无所谓，我自己买个礼物送自己，日子照样过。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 15：控制欲 - 考察【底线消失】
            {
                text: "TA不喜欢你穿某件衣服/去某个聚会，要求你换掉/别去，你会？",
                options: [
                    { text: "A. 乖乖听话，“只要他不生气，我都可以改。”", score: 10, dimension: "boundary" },
                    { text: "B. 沟通原因，如果理由不合理，坚持自己的决定。", score: 2, dimension: "rational" },
                    { text: "C. 表面答应，背地里偷偷穿/偷偷去，每天提心吊胆。", score: 7, dimension: "internal" },
                    { text: "D. “你算老几？管好你自己。”直接怼回去。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 16：PUA迹象 - 考察【瞎眼滤镜】
            {
                text: "TA总是打击你，说你“胖”、“笨”、“除了我没人要你”，你会？",
                options: [
                    { text: "A. 真的觉得自己很差劲，拼命减肥/学习，想让TA满意。", score: 10, dimension: "filter" },
                    { text: "B. 意识到这是精神控制（PUA），严肃警告或直接分手。", score: 2, dimension: "rational" },
                    { text: "C. 很伤心，但又觉得他是为我好，陷入自我怀疑。", score: 7, dimension: "internal" },
                    { text: "D. “你看看你自己那德行，还好意思说我？”互相攻击。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 17：过度付出 - 考察【底线消失】
            {
                text: "为了给TA惊喜，你甚至愿意？",
                options: [
                    { text: "A. 翘课/请假，坐几十个小时硬座火车去看TA，花光生活费。", score: 10, dimension: "boundary" },
                    { text: "B. 在能力范围内准备用心的小礼物，不影响正常生活。", score: 2, dimension: "rational" },
                    { text: "C. 每天给TA点外卖/洗衣服，把自己当保姆一样伺候TA。", score: 7, dimension: "boundary" },
                    { text: "D. 惊喜？不存在的。我只期待TA给我惊喜。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 18：断崖式分手 - 考察【脑补内耗】
            {
                text: "如果TA突然消失，没有任何理由地把你拉黑了，你会？",
                options: [
                    { text: "A. 疯了！换小号加他，去他公司堵他，一定要问个明白。", score: 10, dimension: "boundary" },
                    { text: "B. 很难过，但接受现实。既然不想联系，那就再见。", score: 2, dimension: "rational" },
                    { text: "C. 每天视奸他的动态，幻想他有难言之隐，还会回来找我。", score: 7, dimension: "internal" },
                    { text: "D. “垃圾就该呆在垃圾桶里。” 骂两句然后继续生活。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 19：理想型 - 考察【瞎眼滤镜】
            {
                text: "你心目中的完美对象是？",
                options: [
                    { text: "A. 霸道总裁/救赎者，能拯救我于水火，给我无条件的宠爱。", score: 10, dimension: "filter" },
                    { text: "B. 情绪稳定，三观一致，能聊得来，共同进步的人。", score: 2, dimension: "rational" },
                    { text: "C. 只要长得帅/美，渣一点也无所谓，我能感化TA。", score: 7, dimension: "filter" },
                    { text: "D. 纸片人/偶像。现实中的人类太麻烦了。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 20：自我价值 - 考察【脑补内耗】
            {
                text: "如果这段感情失败了，你会觉得？",
                options: [
                    { text: "A. “我这辈子完了，再也不会有人爱我了。”", score: 10, dimension: "internal" },
                    { text: "B. 遗憾，但也是一种经历，我会遇到更适合的人。", score: 2, dimension: "rational" },
                    { text: "C. “都是他的错！男人没一个好东西！”", score: 7, dimension: "sealed" },
                    { text: "D. “是不是我不够好？不够漂亮？不够有钱？”", score: 10, dimension: "internal" }
                ]
            },
             // 场景 21：画饼充饥 - 考察【瞎眼滤镜】
            {
                text: "TA总是说“以后我有钱了给你买...”、“等我不忙了带你去...”，但从未兑现。",
                options: [
                    { text: "A. 信以为真，每次听都觉得好幸福，一直傻傻等待。", score: 10, dimension: "filter" },
                    { text: "B. 听听就算了，看行动。如果一直不兑现，就当他在放屁。", score: 2, dimension: "rational" },
                    { text: "C. 即使心里知道是饼，也不敢戳穿，怕破坏气氛。", score: 7, dimension: "internal" },
                    { text: "D. 直接翻白眼：“别画了，消化不良。”", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 22：情绪黑洞 - 考察【脑补内耗】
            {
                text: "TA心情不好的时候，把你当垃圾桶发泄负面情绪，你会？",
                options: [
                    { text: "A. 全盘接收，跟着他一起难过，甚至比他还抑郁，想拯救他。", score: 10, dimension: "internal" },
                    { text: "B. 倾听并安慰，但会设立边界，不让他的情绪影响自己。", score: 2, dimension: "rational" },
                    { text: "C. 很累但不敢说，怕他觉得我不体贴，默默忍受。", score: 7, dimension: "boundary" },
                    { text: "D. “关我屁事？别把负能量传染给我。” 找借口挂电话。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 23：同居家务 - 考察【底线消失】
            {
                text: "同居后，家务活基本都是你在干，TA每天只知道玩游戏，你会？",
                options: [
                    { text: "A. 一边抱怨一边干，觉得“这就是爱”，把他当儿子养。", score: 10, dimension: "boundary" },
                    { text: "B. 制定家务分工表，严格执行。不干就别吃饭/别睡床。", score: 2, dimension: "rational" },
                    { text: "C. 忍气吞声，觉得自己多干点能留住他的心。", score: 7, dimension: "internal" },
                    { text: "D. 请个钟点工，或者各过各的，实在不行就分居。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 24：社交隔离 - 考察【底线消失】
            {
                text: "TA不喜欢你的朋友，让你不要和他们来往，你会？",
                options: [
                    { text: "A. 为了他，慢慢疏远了所有朋友，世界里只剩下他。", score: 10, dimension: "boundary" },
                    { text: "B. 告诉他朋友对你很重要，希望他尊重，或者各玩各的。", score: 2, dimension: "rational" },
                    { text: "C. 两边瞒着，在朋友面前说他好话，在他面前不提朋友。", score: 7, dimension: "internal" },
                    { text: "D. “该滚的是你吧？” 朋友如手足，男人如衣服。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 25：暴力倾向 - 考察【瞎眼滤镜】
            {
                text: "吵架时TA摔东西，甚至推搡你，事后又哭着下跪道歉，你会？",
                options: [
                    { text: "A. 心软原谅，“他只是一时冲动，他还是爱我的。”", score: 10, dimension: "filter" },
                    { text: "B. 零容忍！家暴只有0次和无数次，立刻报警/分手/搬走。", score: 2, dimension: "rational" },
                    { text: "C. 害怕但不敢离开，觉得离开他会有危险，或者没人要。", score: 7, dimension: "internal" },
                    { text: "D. 只要他敢动手，我就敢拼命/让他付出代价。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 26：卑微讨好 - 考察【底线消失】
            {
                text: "为了迎合TA的喜好，你改变了自己的穿衣风格/兴趣爱好吗？",
                options: [
                    { text: "A. 完全变成了另一个人，只要他喜欢，我变成什么样都行。", score: 10, dimension: "boundary" },
                    { text: "B. 尝试了解他的爱好，但保留自己的风格，互相尊重。", score: 2, dimension: "rational" },
                    { text: "C. 嘴上说不改，心里偷偷去学，想给他个惊喜。", score: 7, dimension: "internal" },
                    { text: "D. “爱喜欢不喜欢，老子就这样。” 绝不改变。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 27：疑神疑鬼 - 考察【脑补内耗】
            {
                text: "TA接电话避开你，或者改了手机密码，你会？",
                options: [
                    { text: "A. 脑子里上演一部出轨大戏，整天魂不守舍，想方设法偷看。", score: 10, dimension: "internal" },
                    { text: "B. 坦诚询问原因，观察他的反应。如果信任破裂就分开。", score: 2, dimension: "rational" },
                    { text: "C. 装作不在意，但开始偷偷查岗/定位/查开房记录。", score: 7, dimension: "boundary" },
                    { text: "D. “谁还没点隐私？” 我也有秘密，扯平了。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 28：过度解读 - 考察【脑补内耗】
            {
                text: "TA随口夸了一句路人/明星好看，你会？",
                options: [
                    { text: "A. 觉得自己丑爆了，立刻去搜整容/减肥信息，陷入容貌焦虑。", score: 10, dimension: "internal" },
                    { text: "B. “确实挺好看的，我也喜欢。” 一起欣赏美。", score: 2, dimension: "rational" },
                    { text: "C. 酸溜溜地说反话，“那你去找她啊”，然后生气。", score: 7, dimension: "internal" },
                    { text: "D. “切，没我好看。” 自信爆棚。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 29：无缝衔接 - 考察【瞎眼滤镜】
            {
                text: "分手没几天，TA就官宣了新欢，你会？",
                options: [
                    { text: "A. 坚信他是为了气我/疗伤，他还爱着我，我要去挽回。", score: 10, dimension: "filter" },
                    { text: "B. 明白早就绿了/预谋已久，彻底死心，拉黑不见。", score: 2, dimension: "rational" },
                    { text: "C. 视奸新欢的账号，比较自己哪里不如她，痛苦万分。", score: 7, dimension: "internal" },
                    { text: "D. 祝福（锁死），感谢不娶之恩。", score: 5, dimension: "sealed" }
                ]
            },
            // 场景 30：自我感动 - 考察【瞎眼滤镜】
            {
                text: "你经常在朋友圈发仅TA可见的小作文/伤感音乐吗？",
                options: [
                    { text: "A. 每天发！每一条都是写给他看的，希望他能懂我的心。", score: 10, dimension: "filter" },
                    { text: "B. 从不。有话直说，朋友圈是发给自己看的。", score: 2, dimension: "rational" },
                    { text: "C. 偶尔发，发了又删，删了又发，纠结他看没看。", score: 7, dimension: "internal" },
                    { text: "D. 朋友圈全是吃喝玩乐，或者直接对他不可见。", score: 5, dimension: "sealed" }
                ]
            }
        ];

        // 维度分析数据 (Refined for 5 dimensions)
        const dimensionAnalysisData = {
            filter: {
                title: "瞎眼滤镜 (Rose-colored Glasses)",
                extreme: "你的滤镜比城墙还厚！渣男在你眼里是'破碎的小狗'，家暴男是'狂野男孩'。你不仅眼瞎，心也瞎，擅长把玻璃渣当糖吃，自动屏蔽对方的所有缺点。",
                high: "你很容易被表象迷惑，经常给对方加戏。对方明明只是普通操作，你却觉得他'好特别'。要警惕陷入自我感动的陷阱。",
                med: "偶尔会被爱情冲昏头脑，美化对方，但关键时刻还能保留一丝理智。需要朋友时不时把你骂醒。",
                low: "你比较理性，但也会在热恋期短暂失明。只要对方不触碰原则问题，你愿意睁一只眼闭一只眼。",
                safe: "火眼金睛，鉴渣达人。想PUA你？门都没有！你不仅能看清对方，还能看清人性。"
            },
            boundary: {
                title: "底线消失 (No Boundaries)",
                extreme: "你的底线就是没有底线！为了爱可以当保姆、当提款机、当出气筒。你以为这是伟大，其实是廉价。你越退让，对方越得寸进尺。",
                high: "在感情中你习惯性妥协，总觉得'只要我对他好，他就会感动'。要注意，过度的迁就是对自己的残忍。",
                med: "大部分时间有原则，但遇到特别喜欢的人，容易打破原则迁就对方。事后往往会后悔。",
                low: "你有自己的坚持，不会轻易为了对方改变。但偶尔也会因为心软而退让一步。",
                safe: "原则性极强。'爱咋咋地，老子最重要'。任何人触碰你的红线，立刻出局，绝不废话。"
            },
            internal: {
                title: "脑补内耗 (Overthinking)",
                extreme: "内心戏可以拍800集甄嬛传。对方回消息慢了，你已经脑补完'他出轨-分手-我孤独终老'的全过程。情绪完全被对方掌控，像个神经病。",
                high: "非常敏感，对方的一句话、一个眼神都能让你琢磨半天。经常因为过度解读而让自己陷入焦虑。",
                med: "偶尔会胡思乱想，患得患失，尤其是在深夜。但大多数时候能自我调节，转移注意力。",
                low: "心态比较稳，除非对方表现得特别明显，否则不会轻易往坏处想。能分清现实和想象。",
                safe: "钝感力满分。'他没回消息？哦，可能死了吧。' 只要对方不直说，绝不庸人自扰。"
            },
            sealed: {
                title: "水泥封心 (Emotionally Unavailable)",
                extreme: "爱无能患者。回避依恋，拒绝亲密，觉得谈恋爱麻烦。看似人间清醒，实则是因噎废食，害怕受伤所以先拒绝开始。",
                high: "很难真正信任一个人，习惯性地把心门关紧。一旦对方试图靠近，你会本能地想要后退。",
                med: "在亲密关系中比较慢热，需要很长时间建立信任。一旦感觉不安全，会本能地想要逃跑。",
                low: "虽然有点防备心，但遇到合适的人还是愿意尝试打开自己。只是需要对方多一点耐心。",
                safe: "拥有健康的爱的能力。既不回避也不依附，愿意敞开心扉去爱，也接受可能受伤的风险。"
            },
            rational: {
                title: "随时抽身 (Rationality)",
                extreme: "顶级玩家/海王预备役。万花丛中过，片叶不沾身。你谈的不是恋爱，是博弈。过于理性，有时显得冷血。",
                high: "非常理智，时刻在评估这段关系的利弊。一旦发现苗头不对，跑得比谁都快。",
                med: "成熟的恋人。在投入感情的同时，保留了自我和理智。知道什么时候该坚持，什么时候该放手。",
                low: "比较感性，一旦爱上就容易投入。虽然也知道要理智，但往往控制不住自己的心。",
                safe: "一旦爱上就全情投入，很难抽身。容易在一段坏关系里耗尽自己，需要学会及时止损。"
            }
        };

        const app = {
            currentQuestionIndex: 0,
            scores: {
                filter: 0,   // 瞎眼滤镜
                boundary: 0, // 底线消失
                internal: 0, // 脑补内耗
                sealed: 0,   // 水泥封心
                rational: 0  // 随时抽身 (Bonus/Control)
            },
            dimensionScores: {}, // Normalized scores

            start() {
                document.getElementById('page-intro').classList.add('hidden');
                document.getElementById('page-quiz').classList.remove('hidden');
                document.getElementById('page-quiz').classList.add('flex');
                this.renderQuestion();
            },

            renderQuestion() {
                const q = questions[this.currentQuestionIndex];
                document.getElementById('question-text').textContent = `${this.currentQuestionIndex + 1}. ${q.text}`;
                document.getElementById('progress-text').textContent = `问题 ${this.currentQuestionIndex + 1}/${questions.length}`;
                document.getElementById('progress-bar').style.width = `${((this.currentQuestionIndex + 1) / questions.length) * 100}%`;

                const container = document.getElementById('options-container');
                container.innerHTML = '';

                q.options.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'option-item w-full p-4 text-left rounded-xl border border-slate-200 hover:border-pink-300 hover:bg-pink-50 transition-all duration-200 group relative overflow-hidden bg-white';
                    btn.innerHTML = `
                        <div class="relative z-10 flex items-center">
                            <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center mr-3 group-hover:bg-pink-200 group-hover:text-pink-700 transition-colors">
                                ${opt.text.charAt(0)}
                            </span>
                            <span class="text-sm text-slate-700 font-medium group-hover:text-pink-900">${opt.text.substring(2)}</span>
                        </div>
                    `;
                    btn.onclick = () => this.selectOption(opt.score, opt.dimension);
                    container.appendChild(btn);
                });
            },

            selectOption(score, dimension) {
                // Add score to specific dimension
                if (this.scores.hasOwnProperty(dimension)) {
                    this.scores[dimension] += score;
                }

                if (this.currentQuestionIndex < questions.length - 1) {
                    this.currentQuestionIndex++;
                    // Add a tiny delay for visual feedback
                    setTimeout(() => this.renderQuestion(), 150);
                } else {
                    this.showResult();
                }
            },

            showResult() {
                document.getElementById('page-quiz').classList.add('hidden');
                document.getElementById('page-quiz').classList.remove('flex');
                document.getElementById('page-result').classList.remove('hidden');
                document.getElementById('page-result').classList.add('flex');

                // 1. Calculate Total Score (Max 300)
                // Filter, Boundary, Internal are "Bad" (Love Brain) traits.
                // Rational is "Good". Sealed is "Avoidant".
                // Total Love Brain Score = Filter + Boundary + Internal
                // Max possible for these 3 is roughly 30 * 10 = 300 if all answers are toxic.
                // But questions are mixed. Let's sum up the "Love Brain" dimensions.
                
                const loveBrainScore = this.scores.filter + this.scores.boundary + this.scores.internal;
                // Normalize to 0-100 for display
                // Max possible score depends on distribution. 
                // Let's assume max reasonable "Love Brain" score is around 200 (since some Qs target Sealed/Rational).
                // Let's just use the raw sum and cap at 100% logic or scale it.
                // Better: Total Questions = 30. Max Score per Q = 10. Max Total = 300.
                // Love Brain % = (loveBrainScore / 200) * 100 (Estimate max 200 for these 3 dims).
                let percent = Math.min(100, Math.round((loveBrainScore / 180) * 100)); // 180 is a realistic high for these 3 dims
                
                // 2. Determine Level (Meme Title)
                let title = "";
                let memeTitle = "";
                let emoji = "";
                
                if (percent >= 90) {
                    memeTitle = "王宝钏级恋爱脑";
                    title = "(俗称：挖野菜战神)";
                    emoji = "🥗";
                } else if (percent >= 75) {
                    memeTitle = "重度恋爱脑";
                    title = "(俗称：在ICU插管)";
                    emoji = "🚑";
                } else if (percent >= 50) {
                    memeTitle = "中度恋爱脑";
                    title = "(俗称：还有救)";
                    emoji = "🤕";
                } else if (percent >= 30) {
                    memeTitle = "轻微恋爱脑";
                    title = "(俗称：嘴硬王者)";
                    emoji = "🤏";
                } else {
                    memeTitle = "恋爱绝缘体";
                    title = "(俗称：注孤生/水泥封心)";
                    emoji = "🧱";
                    // If sealed score is high, override
                    if (this.scores.sealed > this.scores.rational) {
                         title = "(俗称：水泥封心)";
                    } else {
                         title = "(俗称：人间清醒)";
                         emoji = "🧘";
                    }
                }

                document.getElementById('result-meme-title').textContent = memeTitle;
                document.getElementById('result-title').textContent = title;
                document.getElementById('result-percent').textContent = percent + "%";
                document.getElementById('result-emoji').textContent = emoji;
                
                // Animate bar
                setTimeout(() => {
                    document.getElementById('result-bar').style.width = percent + "%";
                }, 300);

                // 3. Generate Analysis Content
                const result = this.generateAnalysis(percent);
                
                document.getElementById('result-pathology').textContent = result.pathology;
                document.getElementById('result-psychology').textContent = result.psychology; 
                document.getElementById('result-attraction').textContent = result.attraction;
                
                const pList = document.getElementById('prescription-list');
                pList.innerHTML = result.prescription.map(item => `<li>${item}</li>`).join('');
                
                document.getElementById('cure-rate').textContent = result.cureRate;

                // 4. Normalize Scores for Radar (0-10)
                // Filter max ~60? Boundary ~60? 
                // Let's just scale them relatively.
                this.dimensionScores = {
                    filter: this.scores.filter,
                    boundary: this.scores.boundary,
                    internal: this.scores.internal,
                    sealed: this.scores.sealed,
                    rational: this.scores.rational
                };

                // Safely render components with slight delay for DOM readiness
                setTimeout(() => {
                    try {
                        this.renderDimensionAnalysis();
                    } catch (e) {
                        console.error("Render Dimension Analysis Error:", e);
                    }
                    
                    try {
                        this.renderRadarChart();
                    } catch (e) {
                        console.error("Render Radar Chart Error:", e);
                    }
                }, 50);
            },

            generateAnalysis(percent) {
                // Dynamic content based on dominant dimension
                const scores = this.scores;
                const maxDim = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
                
                let pathology = "";
                let psychology = "";
                let attraction = "";
                let prescription = [];
                let cureRate = (100 - percent) + "%";

                // Pathology Logic
                if (maxDim === 'filter') {
                    pathology = "【重度视力障碍】你的大脑自动安装了美颜滤镜，专门针对垃圾对象。哪怕对方是一坨屎，你也能看出巧克力的光泽。你的多巴胺分泌系统严重故障，把虐待当关爱，把冷漠当酷。";
                } else if (maxDim === 'boundary') {
                    pathology = "【自我边界溶解综合症】你就像一块橡皮泥，谁捏成什么样就是什么样。在关系中完全丧失了“我”的概念，为了维持关系不惜割地赔款，甚至出卖灵魂。";
                } else if (maxDim === 'internal') {
                    pathology = "【情绪反刍强迫症】你的一天由对方的一句话决定。过度解读每一个微表情，内心时刻在上演琼瑶剧。你的能量全部消耗在毫无意义的猜谜游戏中，精神极度耗弱。";
                } else if (maxDim === 'sealed') {
                    pathology = "【回避型依恋障碍】看似高冷，实则怂包。因为害怕结束，所以拒绝开始。你用冷漠作为铠甲，成功防御了爱情，也防御了快乐。";
                } else {
                    pathology = "【理智过剩综合症】你太清醒了，清醒得像个AI。每一步都在计算投入产出比，把恋爱谈成了生意。虽然不会受伤，但也永远体会不到心动的失控感。";
                }

                // Psychology Logic (Attachment Style)
                if (scores.sealed > 20 && scores.internal < 10) {
                    psychology = "典型【回避型依恋】(Avoidant)。你潜意识里认为“靠近=危险/失去自由”，所以习惯性推开亲密关系。你的独立是伪装的，内心其实渴望连接但不敢尝试。";
                } else if (scores.internal > 20 || scores.boundary > 20) {
                    psychology = "典型【焦虑型依恋】(Anxious)。你潜意识里认为“我不值得被爱/对方随时会走”，所以需要不断的确认和证明。你的爱充满了抓取感和窒息感。";
                } else if (scores.internal > 15 && scores.sealed > 15) {
                    psychology = "最惨的【恐惧型依恋】(Fearful-Avoidant)。既想靠近又怕受伤，在那反复横跳，把自己和对方都折磨疯了。";
                } else {
                    psychology = "趋向【安全型依恋】(Secure)，或者只是单纯的没心没肺。你的情感模式相对健康，但要注意不要过于理性而显得冷漠。";
                }

                // Attraction Logic
                if (maxDim === 'boundary' || maxDim === 'filter') {
                    attraction = "你简直是【渣男/NPD(自恋型人格)】的吸铁石！他们最喜欢你这种好拿捏、圣母心泛滥、给点甜头就卖命的“血包”。";
                } else if (maxDim === 'internal') {
                    attraction = "你容易吸引【回避型】伴侣。你越追，他越跑；你越情绪化，他越冷漠。你们简直是绝配的虐恋组合。";
                } else if (maxDim === 'rational' || maxDim === 'sealed') {
                    attraction = "你容易吸引【焦虑型】伴侣。因为你的稳（冷）定（漠）让他们感到一种虚假的“强大”，想从你这里吸取安全感。";
                } else {
                    attraction = "你吸引的类型比较随机，主要看脸。";
                }

                // Prescription
                if (percent > 80) {
                    prescription = [
                        "立刻下载国家反诈APP（虽然没用）。",
                        "每天默念三遍：男人/女人多的是，这个不行下一个。",
                        "断联！断联！断联！把注意力收回到自己身上。",
                        "去搞钱！只有钱不会背叛你。"
                    ];
                } else if (percent > 50) {
                    prescription = [
                        "建立“底线清单”，触碰底线立刻报警（比喻）。",
                        "停止自我感动，对方不需要你的牺牲。",
                        "培养一个除了恋爱以外的爱好，比如数钱。",
                    ];
                } else {
                    prescription = [
                        "少想多做，别把对方当神。",
                        "保持现状，多爱自己一点。",
                    ];
                }

                return { pathology, psychology, attraction, prescription, cureRate };
            },

            renderDimensionAnalysis() {
                const container = document.getElementById('dimension-analysis-container');
                if (!container) return;
                
                container.innerHTML = ''; // Clear container
                
                const scores = this.dimensionScores || this.scores; // Fallback
                const dimensions = ['filter', 'boundary', 'internal', 'sealed', 'rational'];
                
                dimensions.forEach(dim => {
                    const score = scores[dim] || 0; 
                    // Safely access global data
                    const data = (typeof dimensionAnalysisData !== 'undefined') ? dimensionAnalysisData[dim] : null;
                    
                    if (!data) {
                        console.warn(`Missing analysis data for dimension: ${dim}`);
                        return;
                    }

                    let text = '';
                    let colorClass = '';
                    
                    // Logic for text selection based on score thresholds (Updated for 5 tiers)
                    // Tiers: Extreme, High, Med, Low, Safe
                    // Filter: Max 100. Extreme > 60, High > 40, Med > 20, Low > 10, Safe <= 10
                    // Boundary: Max 160. Extreme > 80, High > 60, Med > 40, Low > 20, Safe <= 20
                    // Internal: Max 220. Extreme > 100, High > 70, Med > 40, Low > 20, Safe <= 20
                    // Sealed: Max 150. Extreme > 80, High > 60, Med > 40, Low > 20, Safe <= 20
                    // Rational: Max 60. Extreme > 45, High > 35, Med > 25, Low > 15, Safe <= 15

                    if (dim === 'filter') {
                        if (score >= 60) { text = data.extreme; colorClass = 'text-red-700 bg-red-100 border-red-200'; }
                        else if (score >= 40) { text = data.high; colorClass = 'text-red-600 bg-red-50 border-red-100'; }
                        else if (score >= 20) { text = data.med; colorClass = 'text-orange-600 bg-orange-50 border-orange-100'; }
                        else if (score >= 10) { text = data.low; colorClass = 'text-yellow-600 bg-yellow-50 border-yellow-100'; }
                        else { text = data.safe; colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-100'; }
                    } else if (dim === 'boundary') {
                         if (score >= 80) { text = data.extreme; colorClass = 'text-red-700 bg-red-100 border-red-200'; }
                        else if (score >= 60) { text = data.high; colorClass = 'text-red-600 bg-red-50 border-red-100'; }
                        else if (score >= 40) { text = data.med; colorClass = 'text-orange-600 bg-orange-50 border-orange-100'; }
                        else if (score >= 20) { text = data.low; colorClass = 'text-yellow-600 bg-yellow-50 border-yellow-100'; }
                        else { text = data.safe; colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-100'; }
                    } else if (dim === 'internal') {
                         if (score >= 100) { text = data.extreme; colorClass = 'text-red-700 bg-red-100 border-red-200'; }
                        else if (score >= 70) { text = data.high; colorClass = 'text-red-600 bg-red-50 border-red-100'; }
                        else if (score >= 40) { text = data.med; colorClass = 'text-orange-600 bg-orange-50 border-orange-100'; }
                        else if (score >= 20) { text = data.low; colorClass = 'text-yellow-600 bg-yellow-50 border-yellow-100'; }
                        else { text = data.safe; colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-100'; }
                    } else if (dim === 'sealed') {
                        if (score >= 80) { text = data.extreme; colorClass = 'text-slate-800 bg-slate-200 border-slate-300'; }
                        else if (score >= 60) { text = data.high; colorClass = 'text-slate-700 bg-slate-100 border-slate-200'; }
                        else if (score >= 40) { text = data.med; colorClass = 'text-orange-600 bg-orange-50 border-orange-100'; }
                        else if (score >= 20) { text = data.low; colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-100'; }
                        else { text = data.safe; colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-100'; }
                    } else if (dim === 'rational') {
                        if (score >= 45) { text = data.extreme; colorClass = 'text-indigo-700 bg-indigo-100 border-indigo-200'; }
                        else if (score >= 35) { text = data.high; colorClass = 'text-indigo-600 bg-indigo-50 border-indigo-100'; }
                        else if (score >= 25) { text = data.med; colorClass = 'text-orange-600 bg-orange-50 border-orange-100'; }
                        else if (score >= 15) { text = data.low; colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-100'; }
                        else { text = data.safe; colorClass = 'text-red-600 bg-red-50 border-red-100'; } // Too low rational is risky
                    }

                    const item = document.createElement('div');
                    item.className = `p-4 rounded-xl border mb-3 last:mb-0 ${colorClass}`;
                    item.innerHTML = `
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-bold text-sm flex items-center gap-2">
                                ${data.title.split(' ')[0]}
                            </span>
                            <span class="text-xs font-bold px-2 py-1 rounded-full bg-white/50 backdrop-blur-sm border border-white/20">
                                ${score} 分
                            </span>
                        </div>
                        <p class="text-xs leading-relaxed opacity-90 font-medium">${text}</p>
                    `;
                    container.appendChild(item);
                });
            },

            renderRadarChart() {
                const chartDom = document.getElementById('radar-chart');
                if (!chartDom) return;
                
                // Ensure chart container has dimensions
                if (chartDom.clientWidth === 0) {
                    // Force a small delay or use requestAnimationFrame if width is 0
                    requestAnimationFrame(() => this.renderRadarChart());
                    return;
                }

                const existingInstance = echarts.getInstanceByDom(chartDom);
                if (existingInstance) {
                    existingInstance.dispose();
                }
                const myChart = echarts.init(chartDom);
                
                const scores = this.dimensionScores || this.scores;
                
                const option = {
                  radar: {
                      indicator: [
                          { name: '瞎眼滤镜', max: 100 },
                          { name: '底线消失', max: 160 },
                          { name: '脑补内耗', max: 220 },
                          { name: '水泥封心', max: 150 },
                          { name: '随时抽身', max: 60 }
                      ],
                      shape: 'circle',
                      splitNumber: 4,
                        axisName: {
                            color: '#64748b', // slate-500
                            fontSize: 10,
                            fontWeight: 'bold'
                        },
                        splitArea: {
                            areaStyle: {
                                color: ['rgba(241, 245, 249, 0.8)', 'rgba(255, 255, 255, 1)']
                            }
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#cbd5e1' // slate-300
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: '#e2e8f0' // slate-200
                            }
                        }
                    },
                    series: [
                        {
                            name: '恋爱脑维度',
                            type: 'radar',
                            data: [
                                {
                                    value: [
                                        scores.filter || 0,
                                        scores.boundary || 0,
                                        scores.internal || 0,
                                        scores.sealed || 0,
                                        scores.rational || 0
                                    ],
                                    name: '我的诊断',
                                    areaStyle: {
                                        color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [
                                            { color: 'rgba(236, 72, 153, 0.1)', offset: 0 },
                                            { color: 'rgba(236, 72, 153, 0.5)', offset: 1 }
                                        ])
                                    },
                                    lineStyle: {
                                        color: '#ec4899',
                                        width: 2
                                    },
                                    itemStyle: {
                                        color: '#ec4899'
                                    }
                                }
                            ]
                        }
                    ]
                };

                myChart.setOption(option);
                
                window.addEventListener('resize', function() {
                    myChart.resize();
                });
            }
        };
    
;globalThis.extracted = {questions, dimensionAnalysisData, app};
