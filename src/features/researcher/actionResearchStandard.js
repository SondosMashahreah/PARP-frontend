/** PARP Action Research Digital Standard (ARDS 1.0).
 * English keys are stable API field names. The labels are bilingual presentation data.
 * Repeating fields are real arrays, not delimiter-separated strings.
 */
export const STANDARD_VERSION = 'ARDS-1.0'

const field = (key, ar, en, type = 'text', required = false, options = []) => ({ key, ar, en, type, required, options })

export const ACTION_RESEARCH_SECTIONS = [
  {
    key: 'identification', ar: 'تعريف البحث', en: 'Research identification',
    descriptionAr: 'المعلومات الأساسية والباحثون المشاركون؛ لكل باحث مدرسة ومديرية مستقلتان.',
    descriptionEn: 'Core metadata and co-authors, each with their own school and directorate.',
    fields: [
      field('title', 'عنوان البحث', 'Research title', 'text', true),
      field('title_en', 'العنوان بالإنجليزية (إن وجد)', 'English title (if available)'),
      field('research_field', 'مجال البحث', 'Research field', 'text', true),
      field('subject_area', 'المبحث الدراسي', 'Subject area'),
      field('academic_year', 'العام الدراسي', 'Academic year'),
      field('research_language', 'لغة البحث', 'Research language', 'select', false, [
        ['ar', 'العربية', 'Arabic'], ['en', 'الإنجليزية', 'English'], ['both', 'ثنائي اللغة', 'Bilingual'],
      ]),
      field('target_grades', 'الصفوف المستهدفة', 'Target grades', 'list'),
      field('keywords', 'الكلمات المفتاحية (بفواصل)', 'Keywords (comma separated)'),
      field('researchers', 'الباحثون', 'Researchers', 'researchers', true),
    ],
  },
  {
    key: 'problem', ar: 'المشكلة البحثية', en: 'Research problem',
    descriptionAr: 'حددي المشكلة وسياقها والأدلة التي تبرر إجراء البحث.',
    descriptionEn: 'Describe the problem, its context, and the initial evidence.',
    fields: [
      field('problem', 'مشكلة البحث', 'Problem statement', 'long', true),
      field('research_context', 'سياق البحث', 'Research context', 'long'),
      field('evidence_of_problem', 'أدلة وجود المشكلة', 'Evidence of the problem', 'long'),
      field('problem_significance', 'أهمية المشكلة', 'Problem significance', 'long'),
    ],
  },
  {
    key: 'questions', ar: 'الأسئلة والأهداف', en: 'Questions & objectives',
    descriptionAr: 'سؤال رئيسي وأهداف متعددة، مع إمكانية إضافة فرضية حسب طبيعة البحث.',
    descriptionEn: 'A main question, repeatable objectives, and an optional hypothesis.',
    fields: [
      field('research_question', 'السؤال الرئيسي', 'Main research question', 'long', true),
      field('sub_research_questions', 'الأسئلة الفرعية', 'Sub-research questions', 'list'),
      field('research_objectives', 'أهداف البحث', 'Research objectives', 'list', true),
      field('research_hypothesis', 'فرضية البحث (اختياري)', 'Research hypothesis (optional)', 'long'),
    ],
  },
  {
    key: 'participants', ar: 'العينة وبيئة البحث', en: 'Participants & setting',
    descriptionAr: 'وصف الفئة المستهدفة وحجم العينة ومكان وزمان التنفيذ، دون تسجيل أسماء الطلبة.',
    descriptionEn: 'Describe participants, sample size, and research period. Do not enter student names.',
    fields: [
      field('target_population', 'الفئة المستهدفة', 'Target population'),
      field('sample_size', 'حجم العينة', 'Sample size', 'number', true),
      field('participant_characteristics', 'خصائص المشاركين', 'Participant characteristics', 'long'),
      field('research_setting', 'بيئة التنفيذ', 'Research setting'),
      field('research_start_date', 'تاريخ البداية', 'Start date', 'date'),
      field('research_end_date', 'تاريخ النهاية', 'End date', 'date'),
    ],
  },
  {
    key: 'action', ar: 'خطة التدخل الإجرائي', en: 'Action & intervention plan',
    descriptionAr: 'استراتيجية التدخل وخطوات التنفيذ، ويمكن إضافة عدد غير محدود من الخطوات.',
    descriptionEn: 'Intervention strategy and a repeatable plan of action.',
    fields: [
      field('intervention_strategy', 'الاستراتيجية المستخدمة', 'Intervention strategy'),
      field('intervention', 'ملخص التدخل', 'Intervention summary', 'long', true),
      field('intervention_description', 'وصف التدخل بالتفصيل', 'Intervention description', 'long'),
      field('action_plan_steps', 'خطوات التنفيذ', 'Action plan steps', 'steps', true),
      field('learning_activities', 'الأنشطة التعليمية', 'Learning activities', 'list'),
      field('resources_used', 'المصادر والمواد', 'Resources used', 'long'),
    ],
  },
  {
    key: 'collection', ar: 'جمع وتحليل البيانات', en: 'Data collection & analysis',
    descriptionAr: 'اختاري أدوات جمع البيانات وأضيفي تفاصيل كل أداة على حدة.',
    descriptionEn: 'Capture all instruments, stages, and analysis approaches.',
    fields: [
      field('data_collection_methods', 'طرق جمع البيانات', 'Data collection methods', 'list'),
      field('research_instruments', 'أدوات البحث', 'Research instruments', 'instruments', true),
      field('data_collection_stages', 'مراحل جمع البيانات', 'Data collection stages', 'list'),
      field('data_analysis_methods', 'طرق التحليل', 'Data analysis methods', 'list'),
    ],
  },
  {
    key: 'findings', ar: 'النتائج والأدلة', en: 'Results & findings',
    descriptionAr: 'أدخلي النتائج الوصفية أو الكمية حسب منهج البحث؛ ليس شرطًا وجود اختبار قبلي وبعدي.',
    descriptionEn: 'Use quantitative or qualitative findings as appropriate; pre/post tests are not mandatory.',
    fields: [
      field('abstract', 'ملخص البحث', 'Abstract', 'long', true),
      field('results', 'ملخص النتائج', 'Results summary', 'long'),
      field('key_findings', 'النتائج الرئيسية', 'Key findings', 'long', true),
      field('quantitative_results', 'النتائج الكمية', 'Quantitative results', 'long'),
      field('qualitative_results', 'النتائج النوعية', 'Qualitative results', 'long'),
      field('pre_post_comparison', 'مقارنة قبلي/بعدي (إن وجدت)', 'Pre/post comparison (if used)', 'long'),
      field('supporting_evidence', 'وصف الأدلة الداعمة', 'Supporting evidence description', 'long'),
    ],
  },
  {
    key: 'reflection', ar: 'التأمل والتقييم', en: 'Reflection & evaluation',
    descriptionAr: 'التأمل عنصر جوهري في البحث الإجرائي؛ وثقي ما تغير أثناء التنفيذ.',
    descriptionEn: 'Document reflections, challenges, adaptations, and lessons learned.',
    fields: [
      field('researcher_reflection', 'تأمل الباحث', 'Researcher reflection', 'long', true),
      field('implementation_challenges', 'تحديات التنفيذ', 'Implementation challenges', 'long'),
      field('adjustments_during_implementation', 'التعديلات أثناء التنفيذ', 'Adjustments during implementation', 'long'),
      field('lessons_learned', 'الدروس المستفادة', 'Lessons learned', 'long'),
    ],
  },
  {
    key: 'conclusions', ar: 'الخاتمة والتوثيق', en: 'Conclusions & documentation',
    descriptionAr: 'أكملي الاستنتاجات والتوصيات، وأرفقي البحث الأصلي عند الإرسال.',
    descriptionEn: 'Finish with conclusions and recommendations, then attach the original research file.',
    fields: [
      field('conclusions', 'الاستنتاجات', 'Conclusions', 'long', true),
      field('recommendations', 'التوصيات', 'Recommendations', 'long', true),
      field('future_actions', 'الخطوات المستقبلية', 'Future actions', 'long'),
      field('references', 'المراجع', 'References', 'list'),
      field('appendices', 'وصف الملاحق', 'Appendices description', 'long'),
    ],
  },
]

export const isEmpty = (value) => Array.isArray(value)
  ? !value.length || value.every((item) => typeof item === 'string' ? !item.trim() : !Object.values(item || {}).some((v) => String(v || '').trim()))
  : value == null || String(value).trim() === ''

export function requiredMissing(content) {
  return ACTION_RESEARCH_SECTIONS.flatMap((section) => section.fields.filter((item) => {
    if (!item.required) return false
    const value = content[item.key]
    if (item.key === 'sample_size') return !Number.isInteger(Number(value)) || Number(value) < 1
    if (item.key === 'researchers') return !Array.isArray(value) || !value.length || value.some((r) => !r.full_name?.trim() || !r.school?.trim() || !r.directorate?.trim())
    if (item.key === 'action_plan_steps') return !Array.isArray(value) || !value.some((s) => s.activity?.trim())
    if (item.key === 'research_instruments') return !Array.isArray(value) || !value.some((s) => s.name?.trim())
    if (['title', 'research_field', 'problem', 'abstract'].includes(item.key)) return String(value || '').trim().length < 2
    return isEmpty(value)
  }).map((item) => ({ ...item, section: section.key })))
}

export function prepareContent(input = {}) {
  return {
    kind: 'research', standard_version: STANDARD_VERSION,
    researchers: [{ full_name: '', school: '', directorate: '' }],
    research_objectives: [''], sub_research_questions: [], target_grades: [],
    action_plan_steps: [{ objective: '', activity: '', date: '', assessment_tool: '' }],
    research_instruments: [{ name: '', stage: '', description: '' }],
    learning_activities: [], data_collection_methods: [], data_collection_stages: [],
    data_analysis_methods: [], references: [], ...input,
  }
}
