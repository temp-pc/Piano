import os
import re

# ファイルが入っているフォルダのパスを指定
folder_path = './a/'  # ここにフォルダのパスを指定

# フォルダ内のファイルを処理
for filename in os.listdir(folder_path):
    if filename.endswith('.mp3'):
        # "piano samples for piano app "をファイル名から削除
        new_name = re.sub(r'piano samples for piano app ', '', filename)
        
        # ファイル名の変更
        old_file_path = os.path.join(folder_path, filename)
        new_file_path = os.path.join(folder_path, new_name)
        os.rename(old_file_path, new_file_path)
        print(f"Renamed: {filename} -> {new_name}")

print("ファイル名の変更が完了しました！")
