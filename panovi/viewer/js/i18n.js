// 画面に出す文は「日本語を鍵」に英語を引く。
// 日本語ページ(<html lang="ja">)では t は素通しなので、挙動は従来と1ビットも変わらない。
// 英語ページ(viewer/en/)だけが翻訳を受け取る。鍵が無ければ日本語のまま出す(消えるより良い)。
const EN = {
  // 動画ファイルの再生エラー (html-video-player.js)
  '動画の読み込みが中断されました。': 'Video loading was interrupted.',
  'ネットワークエラーで動画を読み込めませんでした。': 'A network error kept the video from loading.',
  '動画をデコードできませんでした。': 'The video could not be decoded.',
  'この動画形式またはURLはブラウザで再生できません。': 'This video format or URL cannot be played in this browser.',
  '動画を読み込めませんでした。': 'The video could not be loaded.',

  // YouTube のエラー (youtube-player.js)
  'YouTube APIの読み込みに失敗しました。': 'Failed to load the YouTube API.',
  'YouTube APIを読み込めませんでした。': 'The YouTube API could not be loaded.',
  'この動画は埋め込み再生が許可されていません。YouTubeで開いてください。':
    'This video does not allow embedded playback. Open it on YouTube.',
  'YouTube動画IDが正しくありません。': 'The YouTube video ID is not valid.',
  'このブラウザでは動画を再生できません。': 'This browser cannot play the video.',
  '動画が見つからないか、非公開になっています。': 'The video was not found or is private.',
  'YouTube動画を読み込めませんでした。': 'The YouTube video could not be loaded.',

  // 画質 (quality-gate.js / app.js)
  '240p以下': '240p or lower',
  '1080p超': 'Above 1080p',
  '自動調整': 'Auto',
  'YouTubeの現在の報告': 'YouTube currently reports',
  '映像をクリック／タップして操作バーを表示': 'Click or tap the video to show its control bar',

  // 操作まわり (app.js)
  '再生': 'Play',
  '一時停止': 'Pause',
  'YouTubeで開く ↗': 'Open on YouTube ↗',
  '動画を直接開く ↗': 'Open the video file ↗',
  'この動画はここでは再生できません': 'This video cannot be played here',
  '動画を読み込めませんでした': 'The video could not be loaded',
  '表示位置を保存できませんでした。': 'Could not save the view position.',
  '自動再生のためミュートで再生中です。Mで解除できます。': 'Muted for autoplay. Press M to unmute.',
  'YouTubeのURLまたは動画ファイル（mp4など）のURLを入力してください。':
    'Enter a YouTube URL or a video file URL (such as an mp4).',
  'フルスクリーン表示を開始できませんでした。': 'Could not enter fullscreen.',
};

const isEnglish = (globalThis.document?.documentElement?.lang ?? 'ja')
  .toLowerCase().startsWith('en');

export const t = isEnglish ? (text) => EN[text] ?? text : (text) => text;
