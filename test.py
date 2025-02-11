import subprocess

def record_screen(output_file="recording.mp4", duration=10):
    # デバイス番号を正しいものに変更
    ffmpeg_command = [
        "ffmpeg",
        "-f", "avfoundation",  # Mac用の画面キャプチャ設定
        "-i", "0:1",             # 正しいデバイス番号 ("0" = Capture screen 0)
        "-t", str(duration),   # 録画する秒数
        "-r", "30",            # フレームレート
        "-probesize", "50M",
        "-analyzeduration", "100M",
        "-pixel_format", "uyvy422",
        output_file
    ]
    subprocess.run(ffmpeg_command)

# ffmpeg -f avfoundation -framerate 30 -i "0:1" -pix_fmt uyvy422 -vcodec libx264 -preset ultrafast -acodec aac -strict -2 my_screen_recording_with_audio.mp4

record_screen("my_screen_recording.mp4", duration=0)
