import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle, AlertTriangle, Loader, Smartphone } from 'lucide-react';
import { sendCommand } from '../../services/api';
import { onSocketEvent } from '../../services/socket';

interface Props {
  deviceToken: string;
  command: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  danger?: boolean;
  onClose: () => void;
}

type Stage = 'sending' | 'delivered' | 'executing' | 'success' | 'error';
type StepStatus = 'pending' | 'active' | 'done' | 'fail';

export function CommandProgressDialog({ deviceToken, command, label, icon: Icon, color, danger, onClose }: Props) {
  const [stage, setStage] = useState<Stage>('sending');
  const [responseMsg, setResponseMsg] = useState('');
  const [error, setError] = useState('');
  const replyRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = onSocketEvent('command:reply', (data: unknown) => {
      if (replyRef.current) return;
      const d = data as { device_token?: string; message?: string; response_data?: string; status?: string };
      if (d.device_token && d.device_token !== deviceToken) return;
      if (d.status === 'error') {
        replyRef.current = true;
        setStage('error');
        setResponseMsg(d.message || d.response_data || 'فشل التنفيذ');
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      } else {
        replyRef.current = true;
        setStage('success');
        setResponseMsg(d.message || d.response_data || 'تم التنفيذ بنجاح');
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
    });
    return () => unsub();
  }, [deviceToken]);

  useEffect(() => {
    execute();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const execute = async () => {
    setStage('sending');
    try {
      const result = await sendCommand(deviceToken, command) as { delivered?: boolean; error?: string }[];
      if (result?.[0]?.error === 'device_offline') {
        setStage('error');
        setError('الجهاز غير متصل');
        return;
      }
      setStage('delivered');

      timeoutRef.current = setTimeout(() => {
        if (!replyRef.current) {
          replyRef.current = true;
          setStage('success');
          setResponseMsg('تم إرسال الأمر (لا يوجد تأكيد تنفيذ)');
        }
      }, 20000);
    } catch {
      setStage('error');
      setError('فشل الاتصال بالخادم');
    }
  };

  const steps: { key: Stage; label: string; icon: typeof Send }[] = [
    { key: 'sending', label: 'إرسال الأمر للخادم', icon: Send },
    { key: 'delivered', label: 'توصيل الأمر للجهاز', icon: Smartphone },
    { key: 'executing', label: 'تنفيذ الأمر على الجهاز', icon: Loader },
  ];

  const getStepStatus = (stepKey: Stage): StepStatus => {
    const order: Stage[] = ['sending', 'delivered', 'executing', 'success', 'error'];
    const currentIdx = order.indexOf(stage);
    const stepIdx = order.indexOf(stepKey);
    if (stage === 'error' && stepIdx <= currentIdx) return stepIdx === currentIdx ? 'fail' : (stepIdx < currentIdx ? 'done' : 'pending');
    if (stage === 'success') return stepIdx < 3 ? 'done' : 'pending';
    if (stepIdx < currentIdx) return 'done';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => { if (e.target === e.currentTarget && (stage === 'success' || stage === 'error')) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
                <Icon size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-surface-900 dark:text-white">{label}</h3>
                <p className="text-[11px] text-surface-500 font-mono" dir="ltr">{command}</p>
              </div>
            </div>
            {(stage === 'success' || stage === 'error') && (
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                <X size={18} className="text-surface-400" />
              </button>
            )}
          </div>

          {/* Steps */}
          <div className="px-5 pb-4 space-y-0">
            {steps.map((step, i) => {
              const status = getStepStatus(step.key);
              const StepIcon = step.icon;
              return (
                <div key={step.key} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      status === 'done' ? 'bg-emerald-100 dark:bg-emerald-500/20' :
                      status === 'active' ? 'bg-blue-100 dark:bg-blue-500/20' :
                      status === 'fail' ? 'bg-rose-100 dark:bg-rose-500/20' :
                      'bg-surface-100 dark:bg-surface-800'
                    }`}>
                      {status === 'done' && <CheckCircle size={16} className="text-emerald-500" />}
                      {status === 'active' && <StepIcon size={16} className="text-blue-500 animate-pulse" />}
                      {status === 'fail' && <AlertTriangle size={16} className="text-rose-500" />}
                      {status === 'pending' && <StepIcon size={16} className="text-surface-300 dark:text-surface-600" />}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-0.5 h-6 my-0.5 rounded-full transition-all ${
                        status === 'done' ? 'bg-emerald-300 dark:bg-emerald-600' : 'bg-surface-200 dark:bg-surface-700'
                      }`} />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <p className={`text-sm font-medium ${
                      status === 'done' ? 'text-emerald-600 dark:text-emerald-400' :
                      status === 'active' ? 'text-blue-600 dark:text-blue-400' :
                      status === 'fail' ? 'text-rose-600 dark:text-rose-400' :
                      'text-surface-400 dark:text-surface-600'
                    }`}>
                      {step.label}
                    </p>
                    {status === 'active' && step.key === 'sending' && (
                      <p className="text-[11px] text-blue-500 dark:text-blue-400 mt-0.5">جاري الإرسال...</p>
                    )}
                    {status === 'active' && step.key === 'delivered' && (
                      <p className="text-[11px] text-blue-500 dark:text-blue-400 mt-0.5">في انتظار تنفيذ الجهاز...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Result */}
          {(stage === 'success' || stage === 'error') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="px-5 pb-5"
            >
              <div className={`p-3 rounded-xl ${
                stage === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20'
                  : 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20'
              }`}>
                <div className="flex items-center gap-2">
                  {stage === 'success' ? (
                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle size={16} className="text-rose-500 shrink-0" />
                  )}
                  <p className={`text-sm font-medium ${
                    stage === 'success' ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                  }`}>
                    {stage === 'success' ? 'تم التنفيذ بنجاح' : 'فشل التنفيذ'}
                  </p>
                </div>
                {(responseMsg || error) && (
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-1.5 mr-6 leading-relaxed">
                    {responseMsg || error}
                  </p>
                )}
              </div>

              <button
                onClick={onClose}
                className={`w-full mt-3 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${
                  stage === 'success' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
                }`}
              >
                إغلاق
              </button>
            </motion.div>
          )}

          {/* Loading indicator while waiting */}
          {stage !== 'success' && stage !== 'error' && (
            <div className="px-5 pb-5">
              <div className="flex items-center justify-center gap-2 py-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
