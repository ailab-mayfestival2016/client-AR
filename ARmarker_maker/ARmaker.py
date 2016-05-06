# coding: UTF-8

from PIL import Image

#ARマーカーのエンコーディング
pattern = {}
pattern[0,0] = [1,0,0,0,0]
pattern[0,1] = [1,0,1,1,1]
pattern[1,0] = [0,1,0,0,1]
pattern[1,1] = [0,1,1,1,0]

def makemap(num):
    bit = format(num, "b") #2進数　あとのほうが小さい数
    if len(bit)>10:
        raise Exception("too big number")
    elif len(bit)<10:
        bit = "0"*(10-len(bit)) + bit

    #左上が0,0で右がx,したがy
    mp = {}
    #外縁を黒く
    for i in range(7):
        mp[0,i] = mp[i,0] = mp[6,i] = mp[i,6] = 0
    for i in range(5):
        data = bit[i*2:i*2+2]
        i1 = 0 if data[0]=="0" else 1
        i2 = 0 if data[1]=="0" else 1
        for j in range(5):
            mp[i+1,j+1] = pattern[i1, i2][j]
    return mp

def printmap(mp):
    for i in range(7):
        for j in range(7):
            print mp[i,j],
        print ""


def create_save_marker(num):
    im = Image.new("RGB", (700,700), "white")
    pixel = im.load()

    mp = makemap(num)

    for i in range(7):
        for j in range(7):
            for ii in range(100):
                for jj in range(100):
                    color = (0,0,0) if mp[i,j]==0 else (255,255,255)
                    pixel[j*100+jj,i*100+ii] = color
    im.save("marker_%d.png"%(num,))

if __name__=="__main__":
    for i in range(10):
        create_save_marker(i*10)
