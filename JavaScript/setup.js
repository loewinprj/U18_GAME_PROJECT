// variable
var canv, // canvas
    cont, // context
    size; // controller of canvas size

var game_controller; // main controller of somethings (important)

var width, height; // canvas width and height

var hitbox_datas; // stack hitboxes of costumes
var soundset; // BGM and SE stacks
var mapchips; // to use ground hit
var grounds; // grounds stacks

var anime_index; // stack indexes of animation objects (effects)
var effects; // stack objectes of effects
var gui; // stack gui objects

var pressed_keys; // user input keys
var player; // player object

var puzzle_datas; // puzzle stage datas
var board_datas; // puzzle boards

// constant
const accelSpeed = 4.1; // Change rate of acceleration
const jumpPower = 6.3; // Jump pwoer of player
const lowAccel = 0.7; // The force of inertia

const fps = 1000 / 30; // for setinterval

const story = 
	`下の方では地球の者たちが緊張気味に固まれり。
	月より来る者たちを迎撃態勢で待てり。
	月より船に乗りやりこし月の者たちが見えきたり。
	ふとその船より落ちし白く輝く物に
	おどろきし者がありきやなどはわからず。
	船より落ちしは麗しききはに輝く白き帯なりき。
	帯はやをらと落ちゆきやがて崖の上に落ちき。
	船より帯を落としし者は言ひき。
	「必要とする者のあるとき、鳳凰がその者へと持ち去なむ」
	かぐや姫が月に帰りてから一千年までもの間
	何者も帯に近づくはなかりき。
	鳳凰が帯を見つけ、持ち去ぬるその時まで。
	帯を持ち去にし鳳凰は三日三晩飛び続け、
	ふと帯を落としき。
	帯がこれまたやをらと落ちしは
	江戸より遠くかれし水井大名の屋敷の庭なりき。
	水井大名が帯を見つけしはあしたの散歩の時なりき。
	屋敷へと持ち帰りよしを
	家来たちに伝ふるとさっそく帯をつけようとするも、
	さることすれば仏様に怒られぬると家来たちに止められき。
	されど、水井大名は仏を信仰せらねばかまはで帯をつけ
	「何も起こらざらずや。こは仏の帯ならず」
	と言ひ放りき。
	そして、この帯は我のものなると
	言ひ家紋の刺繍を施させき。
	刺繍を施す際、最前まで外に落ちたりし帯に
	汚れは一つもつきたらざりしといふ。
	水井大名が帯をつくるようになりて幾日か経りしころ、
	屋敷の家来たちは大名のあらずなりしとののしれり。
	かの帯はなほ仏のものなりけると皆口をそろえてさいひき。
	その直後、最前までねこまのありしところに
	突然水井大名うちいでき。
	一同は驚き今度はあれは狐なると、
	狐が大名に化けたると言ひ出しき。
	それよりは大名の本物なると
	諭すまでにさるころのかかりしと言はれたり。
	やうやう信ぜし家来達は何が起こりきやの説明を促しき。
	大名曰く、
	庭でねこまを見つつ、
	ねこまにならまほしきなどと考へたりしところ
	目の前にうっすらと
	「清少納言知恵の板」が見えてきたといふ。
	それを解きしところねこまになれり。といふなりき。
	とみに信じがたあり話なれど実際最前大名がねこまより
	戻るところを目撃せるなれば信じるほかはなかりき。
	と、そのときその話を聞ける家来の一人言ひき。
	その帯を使はば徳川の屋敷に忍び込み
	情報などを盗み出すべきでは、と。
	情報を盗み出すべくば徳川の世を
	終はらするも可能なのならぬか、と。
	確かにそれも可能なり。
	されど、この帯には欠点ありき。
	そは、体力の消耗のときといふなり。
	また、何度か変化してわかれるが
	おのれとの大きさに差があらばあるほど
	体力の消耗のとくなるといふなりき。
	さて大名は側近の忍者を呼び、
	今水井家に仕えたる忍者の中で
	一番知恵が働き体力のある忍者を
	一人呼ぶようにとおきてき。`.split('\n').map(e=>e.replace('\t', ''));
