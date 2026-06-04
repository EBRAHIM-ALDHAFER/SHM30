import React, { useState } from "react";
import { ThemeColors } from "../types";
import { Zap, Play, CheckCircle, ShieldAlert, Plus, Trash2, Sliders, ToggleLeft } from "lucide-react";

interface WorkflowRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
  timesTriggered: number;
}

interface WorkflowEngineProps {
  theme: ThemeColors;
  onAddLog: (action: string, details: string) => void;
  triggerNotification: (title: string, text: string, type: "success" | "warning" | "info" | "critical" | "ai") => void;
}

export default function WorkflowEngine({
  theme,
  onAddLog,
  triggerNotification
}: WorkflowEngineProps) {
  const [rules, setRules] = useState<WorkflowRule[]>([
    {
      id: "W-1",
      name: "اتصال ومزامنة أرامكس الفورية",
      trigger: "عند حدوث طلب مبيعات جديد بقيمة > 1,500 ر.س",
      action: "شحن ومزامنة الباركود مع بوابات الشحن فوراً وتوليد كوبون هدية",
      active: true,
      timesTriggered: 14
    },
    {
      id: "W-2",
      name: "حذر المخزون الحرج بالأدهان والعود",
      trigger: "عند انخفاض صنف في المستودع عن ١٠ علب حية",
      action: "إرسال إشعار فوري لمدير المشتريات وإثارة طلبية توريد افتراضية",
      active: true,
      timesTriggered: 8
    },
    {
      id: "W-3",
      name: "أتمتة ولاء العميل VIP",
      trigger: "عند تخطي مجموع مشتريات العميل ٦,٠٠٠ ر.س",
      action: "ترقية العضوية للفئة الملكية بالمنظومة وإصدار رسالة ترحيب واتساب",
      active: false,
      timesTriggered: 0
    }
  ]);

  const [ruleName, setRuleName] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState("عند حدوث طلب مبيعات جديد");
  const [selectedAction, setSelectedAction] = useState("إرسال إشعار فوري لمدير المشتريات");

  const handleAddRule = () => {
    if (!ruleName.trim()) return;

    const newRule: WorkflowRule = {
      id: `W-${Date.now().toString().slice(-3)}`,
      name: ruleName.trim(),
      trigger: selectedTrigger,
      action: selectedAction,
      active: true,
      timesTriggered: 0
    };

    setRules((prev) => [...prev, newRule]);
    setRuleName("");
    onAddLog("إعداد أتمتة Workflow", `تم بناء خطة أتمتة جديدة باسم: ${newRule.name}`);
    triggerNotification("🚀 تم بناء الأتمتة", `خطة العمل الحية ${newRule.name} مسجلة ونشطة الآن.`, "success");
  };

  const handleToggleRule = (id: string, name: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
    onAddLog("تحديث أتمتة", `تعديل حالة تشغيل خط العمل الإجرائي: ${name}`);
  };

  const handleDeleteRule = (id: string, name: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    onAddLog("حذف خط أتمتة", `إزالة قانون سير العمل بالكامل: ${name}`);
    triggerNotification("🗑️ تم الحذف", `تمت إزالة قانون الأتمتة ${name} من سهم.`, "warning");
  };

  return (
    <div
      className="p-6 rounded-3xl border text-right space-y-5 shadow-xl font-sans"
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-4" style={{ borderColor: theme.border }}>
        <div className="p-2 rounded-xl bg-amber-500/10 border border-[#D4AF37]/30">
          <Zap className="w-5 h-5 text-[#D4AF37] animate-bounce" />
        </div>

        <div>
          <h3 className="text-sm font-black flex items-center justify-end gap-1.5" style={{ color: theme.text }}>
            <span>لوحة ومحرك خطط الأتمتة (Sahm Rule Workflow & Auto-Pilot Engine)</span>
          </h3>
          <p className="text-[10px]" style={{ color: theme.muted }}>
            قم ببناء قواعد استباقية تربط مبيعات الكاشير وحركة مستودعات الرياض والشرقية لإرسال تنبيهات تلقائية أو ترحيل الفواتير
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Step Configure Rule */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-950/20 border border-slate-900 space-y-4">
          <h4 className="text-xs font-black text-white border-b pb-2 flex items-center justify-end gap-1.5 border-slate-900">
            <span>إنشاء مسار أتمتة استباقي جديد</span>
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
          </h4>

          <div className="space-y-4 text-xs font-bold text-right text-gray-200">
            <div className="space-y-1">
              <label className="text-[10.5px] text-gray-400">اسم خط سير العمل (Workflow Name):</label>
              <input
                type="text"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="مثال: أتمتة رسائل سلة للمبيعات الملكية"
                className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border text-white text-right font-bold outline-none border-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] text-gray-400">الحدث المثير للبث الإجرائي (Event Trigger):</label>
              <select
                value={selectedTrigger}
                onChange={(e) => setSelectedTrigger(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-900 text-white border border-slate-800 cursor-pointer"
              >
                <option value="عند حدوث طلب مبيعات جديد">عند تسجيل طلب مبيعات جديد بقيمة</option>
                <option value="عند انخفاض كمية المخزون بالفرع الرئيسي">عند انخفاض كمية المخزون بالفرع الرئيسي عن ١٥ حبة</option>
                <option value="عند تأخر حالة شاحن أرامكس">عند تأخر حالة شاحن أرامكس لأكثر من ٤٨ ساعة</option>
                <option value="عند إضافة زبون VIP جديد بالمنظومة">عند إضافة زبون VIP جديد بالمنظومة</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] text-gray-400">الإجراء التلقائي التكميلي (Action Consequence):</label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-900 text-white border border-slate-800 cursor-pointer"
              >
                <option value="توليد بون شحن مجاني أرامكس فوري">توليد بون شحن مجاني أرامكس فوري ومزامنة المستودع الرئيسي</option>
                <option value="توليد إشعار رقابي فوري لمدير المخازن">توليد إشعار رقابي فوري لمدير المخازن</option>
                <option value="حفز ذكاء سهم برين لدراسة سلوك المستهلك">حفز ذكاء سهم برين لدراسة سلوك المستهلك وصياغة كرت</option>
                <option value="تأكيد الترحيل المالي بدفاتر الزكاة ERP">تأكيد الترحيل المالي بدفاتر الزكاة ERP حياً</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAddRule}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow active:scale-95 transition-all border-0"
          >
            <Plus className="w-4 h-4" />
            <span>بناء وتفعيل الأتمتة فوراً</span>
          </button>
        </div>

        {/* Existing Rules Column */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-950/20 border border-slate-900 space-y-3.5 overflow-y-auto max-h-[300px]">
          <span className="text-[9px] font-black text-[#D4AF37] block text-right pb-1.5 border-b border-slate-900">
            ⚡ خطوط العمل المفعلة والنشطة للشركة:
          </span>

          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-3.5 rounded-2xl border text-right flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 ${
                rule.active ? "border-[#D4AF37]/45 bg-amber-500/5" : "border-slate-800 bg-slate-950/40"
              }`}
            >
              <div className="flex items-center gap-2 self-center sm:self-start shrink-0">
                <button
                  onClick={() => handleDeleteRule(rule.id, rule.name)}
                  className="p-1 rounded-lg bg-gray-500/10 hover:bg-rose-500/20 hover:text-rose-400 text-gray-400 cursor-pointer border-0 transition-all"
                  title="إزالة وتدمير الأتمتة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleToggleRule(rule.id, rule.name)}
                  className={`p-1 px-2 text-[8px] font-black rounded-lg cursor-pointer border-0 ${
                    rule.active ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-900 text-gray-500"
                  }`}
                >
                  {rule.active ? "مفعّل" : "موجه مؤقت"}
                </button>
                <span className="text-[8.5px] font-mono text-gray-500">تم التشغيل: {rule.timesTriggered}</span>
              </div>

              <div className="grow space-y-0.5 text-center sm:text-right">
                <h4 className="text-xs font-black text-white">{rule.name}</h4>
                <p className="text-[9.5px] text-gray-400 leading-normal">{rule.trigger}</p>
                <p className="text-[9px] text-[#D4AF37] font-bold">🎯 {rule.action}</p>
              </div>
            </div>
          ))}

          {rules.length === 0 && (
            <div className="text-center py-10 text-xs text-gray-500 font-bold">
              لا توجد القوانين أتمتة وخطوط سير مخصصة بالمنظومة حالياً.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
