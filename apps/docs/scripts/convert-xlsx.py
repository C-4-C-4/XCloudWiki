import zipfile
import xml.etree.ElementTree as ET
import json
import os

def clean_str(s):
    if s is None:
        return ""
    return str(s).strip()

def split_comma(s):
    if not s:
        return []
    # 兼容中文逗号和英文逗号，并处理换行
    s = s.replace('，', ',').replace('\n', ',')
    return [x.strip() for x in s.split(',') if x.strip()]

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # xlsx 路径
    xlsx_path = os.path.join(script_dir, "..", "public", "FMS", "原始附魔图鉴.xlsx")
    # json 输出路径
    output_json_path = os.path.join(script_dir, "..", "components", "custom", "enchantments.json")
    
    if not os.path.exists(xlsx_path):
        print(f"Error: Excel file not found at {xlsx_path}")
        return

    print(f"Reading from {xlsx_path}...")
    
    with zipfile.ZipFile(xlsx_path, 'r') as z:
        # 1. 读取 sharedStrings.xml
        shared_strings = []
        try:
            with z.open('xl/sharedStrings.xml') as f:
                tree = ET.parse(f)
                root = tree.getroot()
                # 命名空间通常是 http://schemas.openxmlformats.org/spreadsheetml/2006/main
                ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
                
                # 遍历所有 si (string item)
                sis = root.findall('.//ns:si', ns) or root.findall('.//si')
                for si in sis:
                    # 一个 si 单元格可能有多个 t 标签 (富文本样式分段)
                    t_elements = si.findall('.//ns:t', ns) or si.findall('.//t')
                    text = "".join([t.text for t in t_elements if t.text])
                    shared_strings.append(text)
            print(f"Successfully loaded {len(shared_strings)} shared strings.")
        except Exception as e:
            print("Failed to read sharedStrings.xml, trying fallback. Error:", e)
            return

        # 2. 读取 sheet1.xml
        try:
            with z.open('xl/worksheets/sheet1.xml') as f:
                tree = ET.parse(f)
                root = tree.getroot()
            
            ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            rows = root.findall('.//ns:row', ns) or root.findall('.//row')
            
            enchantments = []
            
            print(f"Total rows found in XML: {len(rows)}")
            
            debug_logs = []
            
            for row in rows:
                row_idx = row.get('r')
                if row_idx == "1":
                    # 第一行是表头，忽略
                    continue
                
                row_data = {}
                cells = row.findall('ns:c', ns) or row.findall('c')
                for cell in cells:
                    cell_ref = cell.get('r')
                    col_letter = ''.join([char for char in cell_ref if not char.isdigit()])
                    
                    val_el = cell.find('ns:v', ns)
                    if val_el is None:
                        val_el = cell.find('v')
                    t = cell.get('t')
                    
                    val = None
                    if val_el is not None:
                        val_str = val_el.text
                        if t == 's': # shared string
                            val = shared_strings[int(val_str)]
                        else:
                            val = val_str
                    row_data[col_letter] = val
                
                # 如果这一行什么都没有，或者是空行，直接跳过
                if not row_data:
                    continue
                
                # A: 名称, B: 可使用类型, C: 品质, D: 等级, E: 效果, F: 数值, G: CD, H: 冲突附魔, I: 备注
                name = clean_str(row_data.get('A'))
                
                # 记录前 20 行数据到 log 里面
                if len(debug_logs) < 20:
                    debug_logs.append(f"Row {row_idx}: name={name}, raw={row_data}")
                
                # 如果名称是空的，或者只是名称这俩字，说明是无效数据或表头重复
                if not name or name == "名称" or name.startswith("编辑者"):
                    continue
                
                # 去除名称中可能的换行符，例如 猪灵杀手\n -> 猪灵杀手
                name = name.replace('\n', '').replace('\r', '')
                
                raw_tools = clean_str(row_data.get('B'))
                quality = clean_str(row_data.get('C'))
                level = clean_str(row_data.get('D'))
                effect = clean_str(row_data.get('E'))
                value = clean_str(row_data.get('F'))
                cd = clean_str(row_data.get('G'))
                raw_conflicts = clean_str(row_data.get('H'))
                tip = clean_str(row_data.get('I'))
                
                # 处理异常数值
                if value == "#VALUE!":
                    value = ""
                
                # 处理 tools (去重和标准化)
                tools_list = split_comma(raw_tools)
                normalized_tools = []
                for t in tools_list:
                    t = t.replace('\n', '').replace('\r', '').strip()
                    if t == "稿":
                        t = "镐"
                    elif t == "锄头":
                        t = "锄"
                    elif t == "所有":
                        t = "全部"
                    if t and t not in normalized_tools:
                        normalized_tools.append(t)
                
                # 处理 conflicts (去重)
                conflicts_list = []
                for c in split_comma(raw_conflicts):
                    c = c.replace('\n', '').replace('\r', '').strip()
                    if c and c not in conflicts_list:
                        conflicts_list.append(c)
                
                # CD 标准化
                if cd:
                    cd = cd.replace('\n', '').replace('\r', '').strip()
                
                # 生成唯一 id
                item_id = f"fms-{len(enchantments) + 1}"
                
                enchantments.append({
                    "id": item_id,
                    "name": name,
                    "tools": normalized_tools,
                    "quality": quality if quality else "白",
                    "level": level if level else None,
                    "effect": effect,
                    "value": value if value else None,
                    "cd": cd if cd else None,
                    "conflicts": conflicts_list,
                    "tip": tip if tip else None
                })
                
            # 确保父级目录存在
            os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
            
            with open(output_json_path, 'w', encoding='utf-8') as out_f:
                json.dump(enchantments, out_f, ensure_ascii=False, indent=2)
                
            print(f"Successfully processed {len(enchantments)} rows.")
            print(f"Saved database to {output_json_path}")
            
            print("\n--- DEBUG LOGS (FIRST 20 ROWS) ---")
            for log in debug_logs:
                print(log)
            print("-----------------------------------\n")
            
        except Exception as e:
            print("Failed to parse sheet1.xml. Error:", e)

if __name__ == "__main__":
    main()
