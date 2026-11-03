import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk

class SpriteSlicerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Phaser Spritesheet Slicer & Viewer (Pro Version)")
        
        self.image = None
        self.tk_image = None
        self.img_width = 0
        self.img_height = 0
        self.preview_photo = None # ตัวแปรเก็บภาพพรีวิว
        
        # --- แผงควบคุม (Control Panel) ---
        control_frame = tk.Frame(root, pady=10, padx=10)
        control_frame.pack(fill=tk.X)
        
        tk.Button(control_frame, text="1. โหลดภาพ", command=self.load_image, bg="#4CAF50", fg="white").pack(side=tk.LEFT, padx=5)
        
        # ขนาดเฟรม (เปลี่ยนค่าเริ่มต้นเป็น 64)
        tk.Label(control_frame, text="กว้าง:").pack(side=tk.LEFT)
        self.entry_width = tk.Entry(control_frame, width=4)
        self.entry_width.insert(0, "64")
        self.entry_width.pack(side=tk.LEFT, padx=2)
        
        tk.Label(control_frame, text="สูง:").pack(side=tk.LEFT)
        self.entry_height = tk.Entry(control_frame, width=4)
        self.entry_height.insert(0, "64")
        self.entry_height.pack(side=tk.LEFT, padx=2)

        # จุดเริ่มต้น (Offset)
        tk.Label(control_frame, text=" | Offset X:").pack(side=tk.LEFT)
        self.entry_offset_x = tk.Entry(control_frame, width=4)
        self.entry_offset_x.insert(0, "0")
        self.entry_offset_x.pack(side=tk.LEFT, padx=2)
        
        tk.Label(control_frame, text="Y:").pack(side=tk.LEFT)
        self.entry_offset_y = tk.Entry(control_frame, width=4)
        self.entry_offset_y.insert(0, "0")
        self.entry_offset_y.pack(side=tk.LEFT, padx=2)
        
        tk.Button(control_frame, text="2. วาดตาราง Grid", command=self.draw_grid, bg="#2196F3", fg="white").pack(side=tk.LEFT, padx=15)
        
        # แสดงผลลัพธ์เลขเฟรม
        self.lbl_result = tk.Label(control_frame, text="เฟรมที่: -", fg="red", font=("Arial", 14, "bold"))
        self.lbl_result.pack(side=tk.LEFT, padx=10)

        # --- แผงพรีวิวภาพที่ตัด (Preview Panel) ---
        preview_frame = tk.Frame(root, pady=5, bg="#ddd")
        preview_frame.pack(fill=tk.X)
        tk.Label(preview_frame, text="ภาพพรีวิว:", bg="#ddd", font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=10)
        
        # 🟢 แก้บัคตรงนี้: เปลี่ยนมาใช้ Canvas แทน Label สำหรับโชว์พรีวิว
        self.preview_canvas = tk.Canvas(preview_frame, bg="white", width=128, height=128) 
        self.preview_canvas.pack(side=tk.LEFT, padx=10)
        
        # --- พื้นที่รูปภาพ (Canvas) ---
        self.canvas_frame = tk.Frame(root)
        self.canvas_frame.pack(fill=tk.BOTH, expand=True)
        
        self.canvas = tk.Canvas(self.canvas_frame, bg="#333")
        self.h_scroll = tk.Scrollbar(self.canvas_frame, orient=tk.HORIZONTAL, command=self.canvas.xview)
        self.v_scroll = tk.Scrollbar(self.canvas_frame, orient=tk.VERTICAL, command=self.canvas.yview)
        
        self.canvas.configure(xscrollcommand=self.h_scroll.set, yscrollcommand=self.v_scroll.set)
        
        self.v_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        self.h_scroll.pack(side=tk.BOTTOM, fill=tk.X)
        self.canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        self.canvas.bind("<Button-1>", self.on_canvas_click)

    def load_image(self):
        file_path = filedialog.askopenfilename(filetypes=[("Image Files", "*.png *.jpg *.jpeg")])
        if not file_path:
            return
            
        # ใช้ .convert("RGBA") เพื่อรักษาพื้นหลังโปร่งใส
        self.image = Image.open(file_path).convert("RGBA") 
        self.img_width, self.img_height = self.image.size
        self.tk_image = ImageTk.PhotoImage(self.image)
        
        self.canvas.config(scrollregion=(0, 0, self.img_width, self.img_height))
        self.canvas.delete("all")
        self.canvas.create_image(0, 0, anchor=tk.NW, image=self.tk_image)
        
        # รีเซ็ตค่าเมื่อโหลดรูปใหม่
        self.lbl_result.config(text="เฟรมที่: -")
        self.preview_canvas.delete("all") # ล้างภาพพรีวิวเก่า
        
        # วาดตารางให้อัตโนมัติเลยตอนโหลดรูป
        self.draw_grid()

    def draw_grid(self):
        if not self.image:
            return
            
        try:
            f_width = int(self.entry_width.get())
            f_height = int(self.entry_height.get())
            offset_x = int(self.entry_offset_x.get())
            offset_y = int(self.entry_offset_y.get())
        except ValueError:
            messagebox.showerror("ข้อผิดพลาด", "กรุณาใส่ตัวเลขให้ถูกต้อง")
            return

        self.canvas.delete("grid_line")
        self.canvas.delete("highlight")
        
        # วาดเส้นแนวตั้ง (สีเขียว เส้นประ)
        for x in range(offset_x, self.img_width + 1, f_width):
            self.canvas.create_line(x, 0, x, self.img_height, fill="#00FF00", tags="grid_line", dash=(4, 2))
            
        # วาดเส้นแนวนอน (สีเขียว เส้นประ)
        for y in range(offset_y, self.img_height + 1, f_height):
            self.canvas.create_line(0, y, self.img_width, y, fill="#00FF00", tags="grid_line", dash=(4, 2))

    def on_canvas_click(self, event):
        if not self.image:
            return
            
        try:
            f_width = int(self.entry_width.get())
            f_height = int(self.entry_height.get())
            offset_x = int(self.entry_offset_x.get())
            offset_y = int(self.entry_offset_y.get())
        except ValueError:
            return

        canvas_x = self.canvas.canvasx(event.x)
        canvas_y = self.canvas.canvasy(event.y)

        adj_x = canvas_x - offset_x
        adj_y = canvas_y - offset_y

        if adj_x < 0 or adj_y < 0:
            return

        col = int(adj_x // f_width)
        row = int(adj_y // f_height)
        
        total_cols = (self.img_width - offset_x) // f_width
        
        if col >= total_cols or canvas_y > self.img_height:
            return

        frame_index = (row * total_cols) + col
        
        # วาดกรอบ Highlight สีเหลือง
        self.canvas.delete("highlight")
        box_x1 = offset_x + (col * f_width)
        box_y1 = offset_y + (row * f_height)
        box_x2 = box_x1 + f_width
        box_y2 = box_y1 + f_height
        
        self.canvas.create_rectangle(box_x1, box_y1, box_x2, box_y2, outline="yellow", width=3, tags="highlight")
        
        self.lbl_result.config(text=f"เฟรมที่: {frame_index}")

        # 🟢 แสดงภาพพรีวิวลงใน Canvas
        try:
            cropped_img = self.image.crop((box_x1, box_y1, box_x2, box_y2))
            cropped_img = cropped_img.resize((f_width * 2, f_height * 2), Image.NEAREST)
            self.preview_photo = ImageTk.PhotoImage(cropped_img)
            
            self.preview_canvas.config(width=f_width * 2, height=f_height * 2)
            self.preview_canvas.delete("all")
            self.preview_canvas.create_image(0, 0, anchor=tk.NW, image=self.preview_photo)
        except Exception as e:
            print(f"Preview Error: {e}")

if __name__ == "__main__":
    root = tk.Tk()
    app = SpriteSlicerApp(root)
    root.geometry("900x700")
    root.mainloop()
