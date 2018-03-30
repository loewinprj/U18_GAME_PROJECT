# 基本構文ルール(重要)  
基本的に，構文の書き方は人それぞれなので，可読性が悪化してしまいます．  
グループ開発では，複数人が同じソースコードを確認するので，重要です．  
構文の規則を定めておきます．基本的なルールを下記のとおりです．  

## 変数宣言  

<b>代入演算子は空白を用いる</b>  

(例)  

<b>正</b>：`var foo = 0;`  
誤：`var foo=0;`  

## 論理演算/演算  
 
<b>論理演算/演算は空白を用いる</b>  

(例1)  

<b>正</b>：`foo_0 == foo_1`  
誤：`foo_0==foo_1`

(例2)  

<b>正</b>：`bool_0 && bool_1;`  
誤：`bool_0&&bool_1`  

(例3)  

<b>正</b>：`a * b;`  
誤：`a*b;`

## 関数宣言  

<b>関数はfunctionで定義する</b>  

JavaScriptの規格ES6(EcmaScript)からは，アロー関数と呼ばれる  
新しい代入法が採用されていますが，グループワークや，大きな  
プロジェクトの開発では可読性が不向きなため，必ず関数は  
`function`を用いて宣言して下さい．また，変数代入での  
関数宣言も行わないようにして下さい．  

(例)

<b>正</b>：`function name(parm,parm_1...){..}`  
誤：`name=function(parm,parm_1...){..}`  
誤：`name=(parm,parm_1...)=>{..}`  

## オブジェクト

<b>オブジェクトはclassを用いる</b>  

オブジェクトの定義には，JavaScriptの規格ES6(EcmaScript)から追加されたclass構文を用います．  
JavaScriptには関数のprototype継承と呼ばれるメソッドが存在します．  
例えば以下のコードを例に説明します．  

<b>詳細：<a href="https://ja.wikipedia.org/wiki/ECMAScript">ECMAScript</a></b>

1. まずは次のような関数を定義します．  
`function calc(a,b){
    this.sum = a + b;
}`  
この関数は第一引数aと第二引数bの合計値を，  
自分自身のsumに格納する関数です．  

2. 関数をオブジェクトとして扱います．  
`var num=new calc(5,3);`  
上のコードでは変数numに  
<b>"sumに8を格納したオブジェクト"</b>  
を引き渡してします．  
new インスタンスはオブジェクト等を新規作成する時に使います．  

<b>詳細：<a href="https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/new">new 演算子について</a></b>

3. prototype継承を定義して，実行します．  
`calc.prototype.sqrt=function(){return this.sum ** 2;}
num.sqrt();`  
上のコードでは，先ず関数calcに対してsqrtと命名した関数を，  
prototype継承として定義して，`num.sqrt();`を実行しています．  
どのようなことが起こるかというと，変数numには，先程説明した  
<b>"sumに8を格納したオブジェクト"</b>  
が格納されています．即ちnumには関数calcがオブジェクトとして入っています．  
そのため，`num.sqrt();`を実行すると，num(calc object)のsumの値(8)に対して，  
`return this.sum ** 2` 8^2 (16)を返すということが行われます．  

<b>詳細：<a href="https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain">継承とプロトタイプチェーン</a></b>

このようなことを応用すると，沢山のキャラクターやオブジェクトを画面上に配置できたり，  
シューティングゲームで例えると，敵を沢山出現させたりすることが可能です．  
Scratchで例えると，new 演算子で作成されたオブジェクトはクローンであり，  
thisで保持する値はローカルリスト(或は変数)と考えればわかると思います．  

<b>
そして，今回はこのprototypeは用いずにclassを用います．簡単な例を紹介します．  
※仕組み(概念)はprototypeと同じです．prototypeはclassの代わりに実装されていました．  
</b>  

(例)  
`class name{`  
`    constructor(parm,parm_1...){..}`  
`    thing(){..}`  
`    thing_1(){..}`  
`}`  
`var human=new name('Taro',15);`  

classはこのように定義します．実際に触って覚えるのが早いです．  

<b>詳細：<a href="https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Classes">クラス</a></b>  

## 命名規則  

<b>単語の区切りは大文字，数字はアンダーバー</b>  

(例)  
<b>正</b>：`var gameTick = 0;`  
誤：`var game_tick = 0;`  

(例1)  
<b>正</b>：`var counter_0 = 0;`  
誤：`var counter0 = 0;`  

#### 上記はJavaScriptに関して書きましたが，HTMLも命名規則は同じです．  

(例)  
<b>正</b>：`<div id="targetId_0"></div>`  
誤：`<div id="target_id0"></div>`  

<b>基本的なルールは以上</b>です．書き漏れがあるかもしれないので，  
何か気になったら質問をお願いします．