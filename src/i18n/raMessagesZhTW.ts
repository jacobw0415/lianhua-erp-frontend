import englishMessages from "ra-language-english";
import type { TranslationMessages } from "ra-core";

/**
 * React Admin 內建按鈕／提示的繁體中文（以 ra-language-english 為底稿後覆寫）。
 */
export const zhTWMessages: TranslationMessages = structuredClone(englishMessages);

const ra = zhTWMessages.ra;
ra.action.add_filter = "新增篩選";
ra.action.add = "新增";
ra.action.back = "返回";
ra.action.bulk_actions =
  "已選 1 筆 |||| 已選 %{smart_count} 筆";
ra.action.cancel = "取消";
ra.action.clear_array_input = "清空列表";
ra.action.clear_input_value = "清除";
ra.action.clone = "複製";
ra.action.confirm = "確認";
ra.action.create = "建立";
ra.action.create_item = "建立 %{item}";
ra.action.delete = "刪除";
ra.action.edit = "編輯";
ra.action.export = "匯出";
ra.action.list = "列表";
ra.action.refresh = "重新整理";
ra.action.remove_filter = "移除篩選";
ra.action.remove_all_filters = "移除所有篩選";
ra.action.remove = "移除";
ra.action.reset = "重設";
ra.action.save = "儲存";
ra.action.search = "搜尋";
ra.action.search_columns = "搜尋欄位";
ra.action.select_all = "全選";
ra.action.select_all_button = "全選";
ra.action.select_row = "選取此列";
ra.action.show = "檢視";
ra.action.sort = "排序";
ra.action.undo = "復原";
ra.action.unselect = "取消選取";
ra.action.expand = "展開";
ra.action.close = "關閉";
ra.action.open_menu = "開啟選單";
ra.action.close_menu = "關閉選單";
ra.action.update = "更新";
ra.action.move_up = "上移";
ra.action.move_down = "下移";
ra.action.open = "開啟";
ra.action.toggle_theme = "切換淺色／深色";
ra.action.select_columns = "欄位";
ra.action.update_application = "重新載入應用程式";

ra.boolean.true = "是";
ra.boolean.false = "否";

ra.page.create = "建立 %{name}";
ra.page.dashboard = "儀表板";
ra.page.edit = "%{name} %{recordRepresentation}";
ra.page.error = "發生錯誤";
ra.page.list = "%{name}";
ra.page.loading = "載入中";
ra.page.not_found = "找不到頁面";
ra.page.show = "%{name} %{recordRepresentation}";
ra.page.empty = "尚無 %{name}。";
ra.page.invite = "要建立一筆嗎？";
ra.page.access_denied = "無權限";
ra.page.authentication_error = "驗證錯誤";

ra.input.file.upload_several = "拖曳檔案到此，或點擊選擇多個檔案。";
ra.input.file.upload_single = "拖曳檔案到此，或點擊選擇檔案。";
ra.input.image.upload_several = "拖曳圖片到此，或點擊選擇多張圖片。";
ra.input.image.upload_single = "拖曳圖片到此，或點擊選擇圖片。";
ra.input.references.all_missing = "找不到參照資料。";
ra.input.references.many_missing = "部分參照資料已不存在。";
ra.input.references.single_missing = "關聯的參照資料已不存在。";
ra.input.password.toggle_visible = "隱藏密碼";
ra.input.password.toggle_hidden = "顯示密碼";

ra.message.about = "關於";
ra.message.access_denied = "您沒有權限存取此頁面";
ra.message.are_you_sure = "確定嗎？";
ra.message.authentication_error = "驗證伺服器發生錯誤，無法驗證您的身分。";
ra.message.auth_error = "驗證權杖時發生錯誤。";
ra.message.bulk_delete_content =
  "確定要刪除此 %{name}？|||| 確定要刪除這 %{smart_count} 筆？";
ra.message.bulk_delete_title = "刪除 %{name} |||| 刪除 %{smart_count} 筆 %{name}";
ra.message.bulk_update_content =
  "確定要更新 %{name} %{recordRepresentation}？|||| 確定要更新這 %{smart_count} 筆？";
ra.message.bulk_update_title =
  "更新 %{name} %{recordRepresentation} |||| 更新 %{smart_count} 筆 %{name}";
ra.message.clear_array_input = "確定要清空整份列表？";
ra.message.delete_content = "確定要刪除此 %{name}？";
ra.message.delete_title = "刪除 %{name} %{recordRepresentation}";
ra.message.details = "詳細";
ra.message.error = "發生用戶端錯誤，無法完成請求。";
ra.message.invalid_form = "表單有誤，請檢查欄位。";
ra.message.loading = "請稍候";
ra.message.no = "否";
ra.message.not_found = "網址可能有誤，或連結已失效。";
ra.message.select_all_limit_reached =
  "項目過多無法全選，僅選取前 %{max} 筆。";
ra.message.unsaved_changes = "有未儲存的變更，確定要離開？";
ra.message.yes = "是";
ra.message.placeholder_data_warning = "網路異常：資料重新整理失敗。";

ra.navigation.clear_filters = "清除篩選";
ra.navigation.no_filtered_results = "使用目前篩選條件找不到 %{name}。";
ra.navigation.no_results = "找不到 %{name}";
ra.navigation.no_more_results = "頁碼 %{page} 超出範圍，請使用上一頁。";
ra.navigation.page_out_of_boundaries = "頁碼 %{page} 超出範圍";
ra.navigation.page_out_from_end = "已是最後一頁";
ra.navigation.page_out_from_begin = "已是第一頁";
ra.navigation.page_range_info = "第 %{offsetBegin}–%{offsetEnd} 筆，共 %{total} 筆";
ra.navigation.partial_page_range_info =
  "第 %{offsetBegin}–%{offsetEnd} 筆，超過 %{offsetEnd} 筆";
ra.navigation.current_page = "第 %{page} 頁";
ra.navigation.page = "前往第 %{page} 頁";
ra.navigation.first = "第一頁";
ra.navigation.last = "最後一頁";
ra.navigation.next = "下一頁";
ra.navigation.previous = "上一頁";
ra.navigation.page_rows_per_page = "每頁筆數：";
ra.navigation.skip_nav = "跳至內容";

ra.sort.sort_by = "依 %{field_lower_first} %{order} 排序";
ra.sort.ASC = "遞增";
ra.sort.DESC = "遞減";

ra.auth.auth_check_error = "請先登入";
ra.auth.user_menu = "個人檔案";
ra.auth.username = "帳號";
ra.auth.password = "密碼";
ra.auth.email = "電子郵件";
ra.auth.sign_in = "登入";
ra.auth.sign_in_error = "登入失敗，請重試";
ra.auth.logout = "登出";

ra.notification.updated = "已更新 |||| 已更新 %{smart_count} 筆";
ra.notification.created = "已建立";
ra.notification.deleted = "已刪除 |||| 已刪除 %{smart_count} 筆";
ra.notification.bad_item = "資料不正確";
ra.notification.item_doesnt_exist = "項目不存在";
ra.notification.http_error = "與伺服器通訊錯誤";
ra.notification.data_provider_error = "dataProvider 錯誤，請查看主控台。";
ra.notification.i18n_error = "無法載入指定語系的翻譯";
ra.notification.canceled = "已取消動作";
ra.notification.logged_out = "工作階段已結束，請重新登入。";
ra.notification.not_authorized = "您無權存取此資源。";
ra.notification.application_update_available = "有新版本可用。";
ra.notification.offline = "無網路連線，無法取得資料。";

ra.validation.required = "必填";
ra.validation.minLength = "至少 %{min} 個字元";
ra.validation.maxLength = "最多 %{max} 個字元";
ra.validation.minValue = "不可小於 %{min}";
ra.validation.maxValue = "不可大於 %{max}";
ra.validation.number = "必須為數字";
ra.validation.email = "必須為有效的電子郵件";
ra.validation.oneOf = "必須為下列之一：%{options}";
ra.validation.regex = "必須符合格式：%{pattern}";
ra.validation.unique = "必須唯一";
