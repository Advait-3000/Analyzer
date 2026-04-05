import asyncio
from fastapi import UploadFile
import main

async def test():
    with open('C:\\Users\\waran_pz4l294\\OneDrive\\Desktop\\test_data.png', 'rb') as f:
        file = UploadFile(f, filename='test_data.png')
        try:
            res = await main.upload_file(file)
            print(res)
        except Exception as e:
            import traceback; traceback.print_exc()

asyncio.run(test())
