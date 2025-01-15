# リサイクル料インボイス一括作成

[自動車リサイクルシステムサイト](http://www.jars.gr.jp/invoice/)で発行可能なインボイスを、一括して入力できるアプリケーションです。

## 使い方

surgeにて公開しています。

`http://batch-acquisition-recycle-invoice.surge.sh/`

リンク貼ると強制HTTPSになってしまうのでURLをアドレスバーにコピペしてください

## なぜsurgeで公開しているのですか？

~~自動車リサイクルシステムのサイトが(未だに)HTTPで運営されているため、その回避策としてHTTPで静的サイトのホスティングが可能なサービスを使用しています。~~

surgeでも勝手にhttpsにリダイレクトされるようになっってしまったので、セルフホスティングで使用してください。

公開しているページに怪しいスクリプトなどが仕込まれていないか不安な方はnodeおよびnpmが使用可能な環境にて下記方法で使用してください。

```
git clone https://github.com/mizuki-momose/batch-acquisition-recycle-invoice.git
cd batch-acquisition-recycle-invoice
npm install
npm run build
npm run preview
```

## 注意点

- このサービスは自動車リサイクルシステムとは一切関係のない個人が制作しています
- このサービスを利用したことで発生した損害等には一切の補償を行いません
