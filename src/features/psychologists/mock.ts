import type { PsychologistProfile } from "./schema";

/*
  Фейковые психологи для разработки. Структура — как на странице терапевта
  rozmova.me: услуги, темы, методы, образование (3 секции, у пунктов могут
  быть фото сертификатов), отзывы.

  Фото — заглушки: аватары с pravatar, сертификаты с placehold.co.
  Когда появятся реальные ассеты — меняем только этот файл.
*/

const cert = (n: number) =>
  `https://placehold.co/240x180/EDE6DB/4d5751?text=Сертифікат+${n}`;

export const mockPsychologists: PsychologistProfile[] = [
  {
    profileId: "p-01",
    fullName: "Олена Коваленко",
    headline: "Психологиня, КПТ-терапевтка",
    avatarUrl: "https://i.pravatar.cc/300?img=47",
    gender: "female",
    qualification: "psychologist",
    experienceYears: 8,
    age: 34,
    priceMinor: 90000,
    couplePriceMinor: null,
    coupleSessionDurationMinutes: null,
    sessionsCount: 640,
    formats: ["online"],
    services: ["Особиста терапія"],
    topics: ["Панічні атаки", "Депресивні стани", "Емоційне вигорання"],
    topicsSecondary: ["Самооцінка та самоцінність", "Втома"],
    topicsExcluded: ["Хімічні залежності", "Спроби самогубства"],
    specializations: ["КПТ", "Схема-терапія"],
    languages: ["uk", "en"],
    bio: "Працюю в когнітивно-поведінковому підході з тривожними та депресивними станами. Вірю, що терапія — це навички, які залишаються з вами назавжди.",
    clientCategories: ["general"],
    aboutMe:
      "Я психологиня з 8-річним досвідом приватної практики. Працюю з дорослими, які відчувають тривогу, апатію чи вигорання і хочуть повернути собі відчуття опори.",
    experienceText:
      "За вісім років роботи провела понад 640 сесій у когнітивно-поведінковому підході. Спеціалізуюсь на схема-терапії для тих, чиї труднощі мають глибше коріння, ніж здається на перший погляд.",
    therapyStyle:
      "Працюю структуровано: даю конкретні техніки та домашні завдання між сесіями. Вважаю, що терапія — це навички, а не одноразове полегшення.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // TODO: replace with real video
    education: {
      higher: [
        {
          title: "КНУ імені Тараса Шевченка",
          speciality: "Психологія",
          years: "2012 – 2017",
          certificateUrls: [cert(1), cert(2)],
        },
      ],
      courses: [
        {
          title: "Український інститут КПТ",
          speciality: "Базовий курс КПТ",
          years: "2018 – 2020",
          certificateUrls: [cert(3)],
        },
        {
          title: "Schema Therapy Society",
          speciality: "Схема-терапія, рівень 1",
          years: "2021",
          certificateUrls: [],
        },
      ],
      other: [],
    },
    reviews: [
      {
        id: "r-01-1",
        author: "Юрій",
        createdAt: "2026-03-07T12:00:00Z",
        rating: 5,
        topics: ["Втома", "Депресивні стани", "Самооцінка та самоцінність"],
        text: "Олена дуже чітко ставить питання, які підштовхують до рефлексії. Розмова йде спокійно, я відчуваю себе затишно і можу ділитися своїми переживаннями.",
      },
      {
        id: "r-01-2",
        author: "Марина",
        createdAt: "2026-01-15T09:30:00Z",
        rating: 5,
        topics: ["Панічні атаки"],
        text: "Після трьох місяців роботи панічні атаки майже зникли. Отримала конкретні техніки, які реально працюють.",
      },
      {
        id: "r-01-3",
        author: "Ігор",
        createdAt: "2026-02-11T10:00:00Z",
        rating: 4,
        topics: ["Емоційне вигорання"],
        text: "Прийшов виснаженим після роботи в проєкті на знос. Олена допомогла розкласти по поличках, що саме мене вимотує.",
      },
      {
        id: "r-01-4",
        author: "Софія",
        createdAt: "2026-04-02T14:20:00Z",
        rating: 5,
        topics: ["Депресивні стани", "Самооцінка та самоцінність"],
        text: "Найкраще, що я зробила для себе за останній рік. Відчуваю різницю вже після кількох сесій.",
      },
      {
        id: "r-01-5",
        author: "Тарас",
        createdAt: "2026-05-19T08:45:00Z",
        rating: 5,
        topics: ["Панічні атаки"],
        text: "Дуже уважно слухає, ніколи не поспішає з висновками. Почуваюся в безпеці на сесіях.",
      },
      {
        id: "r-01-6",
        author: "Христина",
        createdAt: "2026-05-30T16:10:00Z",
        rating: 4,
        topics: ["Втома"],
        text: "Робота повільна, але результат відчутний. Головне — не чекати миттєвого ефекту.",
      },
      {
        id: "r-01-7",
        author: "Максим",
        createdAt: "2026-06-08T11:30:00Z",
        rating: 5,
        topics: ["Емоційне вигорання", "Самооцінка та самоцінність"],
        text: "Психологиня з дуже конкретним підходом — після кожної сесії є розуміння, що робити далі.",
      },
      {
        id: "r-01-8",
        author: "Аліна",
        createdAt: "2026-06-21T09:00:00Z",
        rating: 5,
        topics: ["Депресивні стани"],
        text: "Довго боялась звертатись, зараз жалкую, що не почала раніше. Дуже дякую за терпіння.",
      },
      {
        id: "r-01-9",
        author: "Богдан",
        createdAt: "2026-07-02T13:15:00Z",
        rating: 4,
        topics: ["Панічні атаки", "Втома"],
        text: "Гарний баланс підтримки й конкретних технік. Рекомендую тим, хто шукає структурований підхід.",
      },
    ],
  },
  {
    profileId: "p-02",
    fullName: "Андрій Шевченко",
    headline: "Психотерапевт, гештальт-підхід",
    avatarUrl: "https://i.pravatar.cc/300?img=12",
    gender: "male",
    qualification: "psychotherapist",
    experienceYears: 12,
    age: 45,
    priceMinor: 120000,
    couplePriceMinor: 160000,
    coupleSessionDurationMinutes: 90,
    sessionsCount: 1180,
    formats: ["online"],
    services: ["Особиста терапія", "Парна терапія"],
    topics: ["Сімейні стосунки", "Співзалежність"],
    topicsSecondary: ["Самотність", "Дратівливість"],
    topicsExcluded: ["Хімічні залежності", "ПТСР"],
    specializations: ["Гештальт", "Сімейна терапія"],
    languages: ["uk", "ru"],
    bio: "Допомагаю парам і окремим людям розібратись у стосунках — з іншими та з собою. Працюю чесно, без загальних порад.",
    clientCategories: ["general"],
    aboutMe:
      "Психотерапевт із дванадцятирічним стажем, працюю як з парами, так і з окремими клієнтами над стосунками — з іншими людьми та із собою.",
    experienceText:
      "Понад 1180 проведених сесій у гештальт-підході, повний курс Київського гештальт університету. Окремо волонтерю, підтримуючи родини військових.",
    therapyStyle:
      "Не займаю нічию сторону в парній роботі — допомагаю обом партнерам почути одне одного. Говорю прямо, без загальних порад.",
    videoUrl: null,
    education: {
      higher: [
        {
          title: "НаУКМА",
          speciality: "Соціальна психологія",
          years: "2008 – 2013",
          certificateUrls: [cert(1)],
        },
      ],
      courses: [
        {
          title: "Київський гештальт університет",
          speciality: "Гештальт-терапія, повний курс",
          years: "2014 – 2018",
          certificateUrls: [cert(2), cert(3), cert(4)],
        },
      ],
      other: [
        {
          title: "Волонтерська підтримка родин військових",
          years: "2022 – дотепер",
          certificateUrls: [],
        },
      ],
    },
    reviews: [
      {
        id: "r-02-1",
        author: "Ірина та Павло",
        createdAt: "2026-02-20T18:00:00Z",
        rating: 5,
        topics: ["Сімейні стосунки"],
        text: "Прийшли на межі розлучення, за пів року навчились чути одне одного. Андрій тримає баланс і не стає ні на чий бік.",
      },
    ],
  },
  {
    profileId: "p-03",
    fullName: "Катерина Бондаренко",
    headline: "Дитяча та підліткова психологиня",
    avatarUrl: "https://i.pravatar.cc/300?img=32",
    gender: "female",
    qualification: "psychologist",
    experienceYears: 6,
    age: 29,
    priceMinor: 70000,
    couplePriceMinor: null,
    coupleSessionDurationMinutes: null,
    sessionsCount: 320,
    formats: ["online"],
    services: ["Дитяча терапія"],
    topics: ["РДУГ", "Самооцінка та самоцінність", "Ставлення до їжі"],
    topicsSecondary: ["Дратівливість", "Соціофобія"],
    topicsExcluded: ["Хімічні залежності"],
    specializations: ["Дитяча психологія", "Арт-терапія"],
    languages: ["uk"],
    bio: "Працюю з дітьми від 6 років та підлітками. Через гру та творчість допомагаю дитині впоратись з тим, що словами поки не виходить.",
    clientCategories: ["teens"],
    aboutMe:
      "Дитяча та підліткова психологиня, працюю з дітьми від 6 років. Через гру та творчість допомагаю дитині впоратись з тим, що поки не виходить сказати словами.",
    experienceText:
      "Шість років практики, понад 320 сесій. Пройшла окремий курс з розладів харчової поведінки та практичні інтенсиви з арт-терапії.",
    therapyStyle:
      "Використовую ігрові та арт-техніки замість прямих розмов «по-дорослому» — дітям і підліткам так простіше розкритись. Батьків завжди тримаю в курсі прогресу.",
    videoUrl: null,
    education: {
      higher: [
        {
          title: "Глухівський НПУ ім. Олександра Довженка",
          speciality: "Психологія",
          years: "2022 – 2024",
          certificateUrls: [cert(1), cert(2), cert(3), cert(4), cert(5)],
        },
      ],
      courses: [
        {
          title: "Womens compass school",
          speciality: "Дитяча психологія",
          years: "2022 – 2023",
          certificateUrls: [cert(6)],
        },
        {
          title: "Університет Григорія Сковороди в Переяславі",
          speciality: "Розлади харчової поведінки",
          years: "2024",
          certificateUrls: [],
        },
      ],
      other: [
        {
          title: "МАК, арт-терапія — практичні інтенсиви",
          years: "2023",
          certificateUrls: [],
        },
      ],
    },
    reviews: [
      {
        id: "r-03-1",
        author: "Олена",
        createdAt: "2026-04-02T10:00:00Z",
        rating: 5,
        topics: ["Психолог з РДУГ"],
        text: "Син з РДУГ нарешті має людину, до якої сам хоче йти на сесії. Бачимо прогрес у школі і вдома.",
      },
      {
        id: "r-03-2",
        author: "Тетяна",
        createdAt: "2026-02-11T14:00:00Z",
        rating: 4,
        topics: ["Ставлення до їжі"],
        text: "Донька-підліток почала нормально їсти і говорити про свої почуття. Дякуємо Катерині за терпіння.",
      },
    ],
  },
  {
    profileId: "p-04",
    fullName: "Ірина Мельник",
    headline: "Травматерапевтка, EMDR",
    avatarUrl: "https://i.pravatar.cc/300?img=44",
    gender: "female",
    qualification: "psychotherapist",
    experienceYears: 10,
    age: 38,
    priceMinor: 110000,
    couplePriceMinor: null,
    coupleSessionDurationMinutes: null,
    sessionsCount: 870,
    formats: ["online"],
    services: ["Особиста терапія"],
    topics: ["ПТСР", "Кризи і травми", "Втрата та горе"],
    topicsSecondary: ["Панічні атаки", "Нав'язливі думки та ритуали"],
    topicsExcluded: ["Ставлення до їжі"],
    specializations: ["EMDR", "Травматерапія"],
    languages: ["uk", "en"],
    bio: "Спеціалізуюсь на роботі з травмою — бойовою, втратою, насиллям. EMDR-терапевтка, сертифікована Europe EMDR Association.",
    clientCategories: ["veterans", "abuse_survivors", "grief"],
    aboutMe:
      "Травматерапевтка, спеціалізуюсь на роботі з бойовою травмою, втратою та насиллям. Маю сертифікацію Europe EMDR Association.",
    experienceText:
      "Десять років практики, понад 870 сесій. Окремо веду кризову підтримку ЗСУ та родин військових у межах волонтерської ініціативи.",
    therapyStyle:
      "Основний метод — EMDR, який дозволяє переробити травматичний досвід без багаторазового детального переживання подій. Темп сесії завжди задає клієнт.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // TODO: replace with real video
    education: {
      higher: [
        {
          title: "ЛНУ імені Івана Франка",
          speciality: "Клінічна психологія",
          years: "2010 – 2015",
          certificateUrls: [cert(1)],
        },
      ],
      courses: [
        {
          title: "EMDR Europe",
          speciality: "EMDR-терапія, акредитація",
          years: "2019 – 2021",
          certificateUrls: [cert(2), cert(3)],
        },
      ],
      other: [
        {
          title: "Кризова підтримка ЗСУ та родин, ГО «Вільний вибір»",
          years: "2022 – дотепер",
          certificateUrls: [],
        },
      ],
    },
    reviews: [
      {
        id: "r-04-1",
        author: "Володимир",
        createdAt: "2026-05-01T16:00:00Z",
        rating: 5,
        topics: ["ПТСР"],
        text: "Після повернення зі служби не спав нормально півтора року. З Іриною за чотири місяці сон повернувся. Рекомендую побратимам.",
      },
    ],
  },
  {
    profileId: "p-05",
    fullName: "Дмитро Ткаченко",
    headline: "Психолог, психоаналітичний підхід",
    avatarUrl: "https://i.pravatar.cc/300?img=59",
    gender: "male",
    qualification: "psychotherapist",
    experienceYears: 15,
    age: 52,
    priceMinor: 150000,
    couplePriceMinor: null,
    coupleSessionDurationMinutes: null,
    sessionsCount: 2100,
    formats: ["online"],
    services: ["Особиста терапія"],
    topics: ["Самотність", "Ставлення до грошей", "Прокрастинація"],
    topicsSecondary: ["Емоційне вигорання", "Профорієнтація"],
    topicsExcluded: ["Спроби самогубства", "Хімічні залежності"],
    specializations: ["Психоаналіз", "Екзистенційний аналіз"],
    languages: ["uk", "ru", "en"],
    bio: "П'ятнадцять років приватної практики. Працюю з глибинними запитами: сенс, самотність, повторювані життєві сценарії.",
    clientCategories: ["general"],
    aboutMe:
      "Психолог із психоаналітичним підходом, п'ятнадцять років приватної практики. Працюю з глибинними запитами: сенс, самотність, повторювані життєві сценарії.",
    experienceText:
      "Понад 2100 проведених сесій, навчався в Українській асоціації психоаналізу протягом п'яти років. Фокусуюсь на довготривалій роботі, а не швидких рішеннях.",
    therapyStyle:
      "Не даю готових відповідей — допомагаю клієнту самому дійти до розуміння власних мотивів. Сесії проходять у вільному форматі розмови.",
    videoUrl: null,
    education: {
      higher: [
        {
          title: "ХНУ імені В. Н. Каразіна",
          speciality: "Психологія",
          years: "2005 – 2010",
          certificateUrls: [],
        },
      ],
      courses: [
        {
          title: "Українська асоціація психоаналізу",
          speciality: "Психоаналітична психотерапія",
          years: "2011 – 2016",
          certificateUrls: [cert(1), cert(2)],
        },
      ],
      other: [],
    },
    reviews: [
      {
        id: "r-05-1",
        author: "Анонімно",
        createdAt: "2026-03-19T11:00:00Z",
        rating: 5,
        topics: ["Самотність"],
        text: "Дмитро не дає готових відповідей, але після сесій я вперше за роки почав розуміти, чому роблю те, що роблю.",
      },
    ],
  },
  {
    profileId: "p-06",
    fullName: "Наталія Кравченко",
    headline: "Сімейна психотерапевтка",
    avatarUrl: "https://i.pravatar.cc/300?img=26",
    gender: "female",
    qualification: "psychotherapist",
    experienceYears: 9,
    age: 40,
    priceMinor: 100000,
    couplePriceMinor: 140000,
    coupleSessionDurationMinutes: 90,
    sessionsCount: 760,
    formats: ["online"],
    services: ["Парна терапія", "Особиста терапія"],
    topics: ["Сімейні стосунки", "Народження дитини", "Аб'юз, емоційне насилля"],
    topicsSecondary: ["Співзалежність"],
    topicsExcluded: ["РДУГ"],
    specializations: ["Системна сімейна терапія"],
    languages: ["uk"],
    bio: "Системна сімейна терапевтка. Працюю з парами на всіх етапах — від кризи перших років до синдрому порожнього гнізда.",
    clientCategories: ["abuse_survivors"],
    aboutMe:
      "Сімейна психотерапевтка, працюю з парами на всіх етапах стосунків — від кризи перших років спільного життя до синдрому порожнього гнізда.",
    experienceText:
      "Дев'ять років практики, понад 760 сесій. Закінчила секцію сімейної терапії УСП зі спеціалізацією в системному підході.",
    therapyStyle:
      "Розглядаю пару як систему, де зміна одного впливає на обох. Багато уваги приділяю темі емоційного насилля та відновленню довіри.",
    videoUrl: null,
    education: {
      higher: [
        {
          title: "НПУ імені М. П. Драгоманова",
          speciality: "Практична психологія",
          years: "2011 – 2016",
          certificateUrls: [cert(1)],
        },
      ],
      courses: [
        {
          title: "УСП, секція сімейної терапії",
          speciality: "Системна сімейна психотерапія",
          years: "2017 – 2021",
          certificateUrls: [cert(2)],
        },
      ],
      other: [],
    },
    reviews: [],
  },
  {
    profileId: "p-07",
    fullName: "Юлія Савченко",
    headline: "Психологиня, робота з РХП та тілесністю",
    avatarUrl: "https://i.pravatar.cc/300?img=20",
    gender: "female",
    qualification: "psychologist",
    experienceYears: 5,
    age: 31,
    priceMinor: 65000,
    couplePriceMinor: null,
    coupleSessionDurationMinutes: null,
    sessionsCount: 280,
    formats: ["online"],
    services: ["Особиста терапія"],
    topics: ["Ставлення до їжі", "Самооцінка та самоцінність"],
    topicsSecondary: ["Втома", "Депресивні стани"],
    topicsExcluded: ["ПТСР", "Хімічні залежності"],
    specializations: ["Тілесно-орієнтована терапія", "КПТ"],
    languages: ["uk", "ru"],
    bio: "Допомагаю відновити нормальні стосунки з їжею та власним тілом. Без дієт, без сорому, без «просто візьми себе в руки».",
    clientCategories: ["eating_disorders"],
    aboutMe:
      "Психологиня, працюю з розладами харчової поведінки та відновленням стосунків із власним тілом. Без дієт, без сорому, без «просто візьми себе в руки».",
    experienceText:
      "П'ять років практики, 280 сесій. Проходила спеціалізований курс з діагностики та терапії РХП.",
    therapyStyle:
      "Поєдную тілесно-орієнтовану терапію з КПТ — працюю і з думками про їжу, і з тілесними відчуттями одночасно.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // TODO: replace with real video
    education: {
      higher: [
        {
          title: "ОНУ імені І. І. Мечникова",
          speciality: "Психологія",
          years: "2015 – 2020",
          certificateUrls: [],
        },
      ],
      courses: [
        {
          title: "Центр розладів харчової поведінки",
          speciality: "РХП: діагностика та терапія",
          years: "2021 – 2022",
          certificateUrls: [cert(1), cert(2)],
        },
      ],
      other: [],
    },
    reviews: [
      {
        id: "r-07-1",
        author: "Дарія",
        createdAt: "2026-04-25T13:00:00Z",
        rating: 5,
        topics: ["Ставлення до їжі"],
        text: "Вперше за десять років не рахую калорії і не ненавиджу себе за з'їдене. Юлія — неймовірна.",
      },
    ],
  },
  {
    profileId: "p-08",
    fullName: "Максим Поліщук",
    headline: "Психолог для підприємців і керівників",
    avatarUrl: "https://i.pravatar.cc/300?img=68",
    gender: "male",
    qualification: "psychologist",
    experienceYears: 7,
    age: 36,
    priceMinor: 130000,
    couplePriceMinor: null,
    coupleSessionDurationMinutes: null,
    sessionsCount: 540,
    formats: ["online"],
    services: ["Особиста терапія"],
    topics: ["Емоційне вигорання", "Ставлення до грошей", "Прокрастинація", "Мотивація"],
    topicsSecondary: ["Профорієнтація"],
    topicsExcluded: ["Втрата та горе", "Спроби самогубства"],
    specializations: ["КПТ", "Терапія прийняття і відповідальності (ACT)"],
    languages: ["uk", "en"],
    bio: "Десять років у бізнесі до психології — знаю вигорання зсередини. Працюю з фаундерами, керівниками та тими, хто тягне забагато.",
    clientCategories: ["business"],
    aboutMe:
      "Психолог для підприємців і керівників. До психології десять років працював у бізнесі — знаю вигорання зсередини, а не з підручника.",
    experienceText:
      "Сім років практики, 540 сесій. Сертифікований у терапії прийняття та відповідальності (ACT).",
    therapyStyle:
      "Працюю структурно і прямо, без зайвої води — після кожної сесії клієнт іде з конкретним планом дій.",
    videoUrl: null,
    education: {
      higher: [
        {
          title: "КПІ, друга вища — МАУП",
          speciality: "Психологія",
          years: "2016 – 2019",
          certificateUrls: [cert(1)],
        },
      ],
      courses: [
        {
          title: "ACT Ukraine",
          speciality: "Терапія прийняття і відповідальності",
          years: "2020 – 2021",
          certificateUrls: [],
        },
      ],
      other: [],
    },
    reviews: [
      {
        id: "r-08-1",
        author: "Олег",
        createdAt: "2026-01-30T08:00:00Z",
        rating: 4,
        topics: ["Емоційне вигорання"],
        text: "Прямий, структурний, без води. Після кожної сесії — конкретний план. Мінус зірка за те, що складно зловити вільний слот.",
      },
    ],
  },
  {
    profileId: "p-09",
    fullName: "Оксана Лисенко",
    headline: "Психологиня, перинатальний напрям",
    avatarUrl: "https://i.pravatar.cc/300?img=38",
    gender: "female",
    qualification: "psychologist",
    experienceYears: 11,
    age: 43,
    priceMinor: 85000,
    couplePriceMinor: 120000,
    coupleSessionDurationMinutes: 60,
    sessionsCount: 930,
    formats: ["online"],
    services: ["Особиста терапія", "Парна терапія"],
    topics: ["Народження дитини", "Вагітність", "Репродуктивне здоров'я", "Втрата та горе"],
    topicsSecondary: ["Сімейні стосунки"],
    topicsExcluded: ["Хімічні залежності", "РДУГ"],
    specializations: ["Клієнт-центрована терапія", "Символдрама"],
    languages: ["uk"],
    bio: "Супроводжую жінок та пари на шляху до батьківства: вагітність, пологи, втрати, репродуктивні складнощі, післяпологовий період.",
    clientCategories: ["grief", "general"],
    aboutMe:
      "Психологиня перинатального напряму, супроводжую жінок та пари на шляху до батьківства: вагітність, пологи, втрати, післяпологовий період.",
    experienceText:
      "Одинадцять років практики, понад 930 сесій. Проходила навчання в Інституті перинатальної психології та базовий курс доула-супроводу.",
    therapyStyle:
      "Працюю дбайливо з темами, де багато сорому й тиші — втратами вагітності, складними пологами. Клієнт сам визначає темп розмови.",
    videoUrl: null,
    education: {
      higher: [
        {
          title: "ЧНУ імені Юрія Федьковича",
          speciality: "Психологія",
          years: "2009 – 2014",
          certificateUrls: [cert(1)],
        },
      ],
      courses: [
        {
          title: "Інститут перинатальної психології",
          speciality: "Перинатальна психологія",
          years: "2016 – 2018",
          certificateUrls: [cert(2), cert(3)],
        },
      ],
      other: [
        {
          title: "Доула-супровід, базовий курс",
          years: "2019",
          certificateUrls: [],
        },
      ],
    },
    reviews: [
      {
        id: "r-09-1",
        author: "Софія",
        createdAt: "2026-05-14T15:00:00Z",
        rating: 5,
        topics: ["Народження дитини"],
        text: "Оксана провела мене через складну вагітність і перші місяці з малюком. Це була найважливіша підтримка в моєму житті.",
      },
    ],
  },
  {
    profileId: "p-10",
    fullName: "Тарас Романюк",
    headline: "Психотерапевт, залежності та співзалежність",
    avatarUrl: "https://i.pravatar.cc/300?img=53",
    gender: "male",
    qualification: "psychotherapist",
    experienceYears: 14,
    age: 47,
    priceMinor: 95000,
    couplePriceMinor: null,
    coupleSessionDurationMinutes: null,
    sessionsCount: 1450,
    formats: ["online"],
    services: ["Особиста терапія"],
    topics: ["Хімічні залежності", "Співзалежність", "Дратівливість"],
    topicsSecondary: ["Ставлення до грошей", "Самотність"],
    topicsExcluded: ["Народження дитини", "Вагітність"],
    specializations: ["Транзактний аналіз", "Гештальт"],
    languages: ["uk", "ru"],
    bio: "Чотирнадцять років працюю із залежностями та людьми поруч із залежними. Без моралізаторства — тільки робота.",
    clientCategories: ["general"],
    aboutMe:
      "Психотерапевт, чотирнадцять років працюю із залежностями та людьми поруч із залежними — партнерами, батьками, дітьми.",
    experienceText:
      "Понад 1450 сесій, навчався транзактному аналізу в УАТА. Дев'ять років вів групову терапію в реабілітаційному центрі «Крок».",
    therapyStyle:
      "Працюю без моралізаторства — тільки конкретна робота з патернами поведінки. Однаково уважний і до залежної людини, і до її оточення.",
    videoUrl: null,
    education: {
      higher: [
        {
          title: "Прикарпатський НУ імені Василя Стефаника",
          speciality: "Психологія",
          years: "2006 – 2011",
          certificateUrls: [],
        },
      ],
      courses: [
        {
          title: "УАТА",
          speciality: "Транзактний аналіз, 202",
          years: "2013 – 2017",
          certificateUrls: [cert(1)],
        },
      ],
      other: [
        {
          title: "Реабілітаційний центр «Крок» — груповий терапевт",
          years: "2012 – 2019",
          certificateUrls: [],
        },
      ],
    },
    reviews: [
      {
        id: "r-10-1",
        author: "Анонімно",
        createdAt: "2026-02-05T19:00:00Z",
        rating: 5,
        topics: ["Співзалежність"],
        text: "Завдяки Тарасу я вперше зрозуміла, що не мушу рятувати чоловіка ціною власного життя. Два роки тверезості в родині.",
      },
    ],
  },
  {
    profileId: "p-11",
    fullName: "Світлана Гончар",
    headline: "Психологиня, підтримка в еміграції",
    avatarUrl: "https://i.pravatar.cc/300?img=16",
    gender: "female",
    qualification: "psychologist",
    experienceYears: 4,
    age: 33,
    priceMinor: 55000,
    couplePriceMinor: null,
    coupleSessionDurationMinutes: null,
    sessionsCount: 190,
    formats: ["online"],
    services: ["Особиста терапія"],
    topics: ["Самотність", "Втома"],
    topicsSecondary: ["Панічні атаки", "Депресивні стани"],
    topicsExcluded: ["ПТСР"],
    specializations: ["Клієнт-центрована терапія", "Позитивна психотерапія"],
    languages: ["uk", "en"],
    bio: "Сама пройшла еміграцію 2022 року — знаю, як воно. Працюю з українцями за кордоном: адаптація, провина вцілілого, туга за домом.",
    clientCategories: ["adaptation"],
    aboutMe:
      "Психологиня, сама пройшла еміграцію 2022 року — знаю це не з теорії. Працюю з українцями за кордоном.",
    experienceText:
      "Чотири роки практики, 190 сесій. Пройшла базовий курс позитивної психотерапії в Wiesbaden Academy.",
    therapyStyle:
      "Багато уваги приділяю темам провини вцілілого, туги за домом і адаптації в новій країні — з власним досвідом усередині.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // TODO: replace with real video
    education: {
      higher: [
        {
          title: "ЗНУ",
          speciality: "Психологія",
          years: "2016 – 2021",
          certificateUrls: [cert(1)],
        },
      ],
      courses: [
        {
          title: "Wiesbaden Academy of Positive Psychotherapy",
          speciality: "Позитивна психотерапія, базовий рівень",
          years: "2023",
          certificateUrls: [cert(2)],
        },
      ],
      other: [],
    },
    reviews: [
      {
        id: "r-11-1",
        author: "Христина",
        createdAt: "2026-03-28T17:00:00Z",
        rating: 5,
        topics: ["Адаптація, еміграція"],
        text: "Розмовляти з людиною, яка сама через це пройшла — безцінно. Перестала почуватись чужою в новій країні.",
      },
    ],
  },
  {
    profileId: "p-12",
    fullName: "Вікторія Дорошенко",
    headline: "Психологиня, підліткова та сімейна терапія",
    avatarUrl: "https://i.pravatar.cc/300?img=41",
    gender: "female",
    qualification: "psychologist",
    experienceYears: 3,
    age: 28,
    priceMinor: 40000,
    couplePriceMinor: null,
    coupleSessionDurationMinutes: null,
    sessionsCount: 85,
    formats: ["online"],
    services: ["Дитяча терапія", "Особиста терапія"],
    topics: ["Самооцінка та самоцінність", "Дратівливість", "Соціофобія"],
    topicsSecondary: ["Прокрастинація"],
    topicsExcluded: ["Хімічні залежності", "ПТСР"],
    specializations: ["КПТ", "Наративна психологія"],
    languages: ["uk"],
    bio: "Працюю з підлітками 12+ та молодими дорослими. Тривога, сором'язливість, конфлікти з батьками — приходьте, розберемось.",
    clientCategories: ["teens", "separation"],
    aboutMe:
      "Психологиня, працюю з підлітками 12+ та молодими дорослими. Тривога, сором'язливість, конфлікти з батьками — приходьте, розберемось.",
    experienceText:
      "Три роки практики, 85 сесій, паралельно працюю шкільною психологинею в ліцеї — щодня бачу підлітків у реальному контексті.",
    therapyStyle:
      "Говорю з підлітками як з рівними, без повчань. Використовую наративні техніки, щоб клієнт сам переосмислив свою історію.",
    videoUrl: null,
    education: {
      higher: [
        {
          title: "ВНУ імені Лесі Українки",
          speciality: "Практична психологія",
          years: "2018 – 2023",
          certificateUrls: [cert(1)],
        },
      ],
      courses: [],
      other: [
        {
          title: "Шкільна психологиня, ліцей №12",
          years: "2023 – дотепер",
          certificateUrls: [],
        },
      ],
    },
    reviews: [],
  },
  {
    profileId: "p-13",
    fullName: "Мар'яна Гнатюк",
    headline: "Психологиня, підтримка вразливих груп",
    avatarUrl: "https://i.pravatar.cc/300?img=25",
    gender: "female",
    qualification: "psychologist",
    experienceYears: 13,
    age: 41,
    priceMinor: 95000,
    couplePriceMinor: 130000,
    coupleSessionDurationMinutes: 90,
    sessionsCount: 1500,
    formats: ["online"],
    services: ["Особиста терапія", "Парна терапія"],
    topics: [
      "Панічні атаки",
      "Депресивні стани",
      "Сімейні стосунки",
      "Втрата та горе",
      "ПТСР",
      "Кризи і травми",
      "Емоційне вигорання",
      "Самооцінка та самоцінність",
      "Хімічні залежності",
      "Ставлення до їжі",
      "Психолог для ветеранів та їхніх родин",
      "ЛГБТК+ дружній психолог",
      "Підтримка ВПО",
      "РХП (розлади харчової поведінки)",
      "Сепарація від батьків",
    ],
    topicsSecondary: ["Дратівливість", "Самотність"],
    topicsExcluded: ["Спроби самогубства"],
    specializations: [
      "КПТ",
      "EMDR",
      "Гештальт",
      "Схема-терапія",
      "Травматерапія",
      "Системна сімейна терапія",
    ],
    languages: ["uk", "en"],
    bio: "Тринадцять років працюю з людьми, які пройшли через кризу — війну, втрату, дискримінацію, залежність. Створюю простір без осуду для будь-якого досвіду.",
    clientCategories: [
      "veterans",
      "lgbtq",
      "idp",
      "eating_disorders",
      "separation",
      "general",
    ],
    aboutMe:
      "Тринадцять років працюю з людьми, які пройшли через кризу — війну, втрату, дискримінацію, залежність. Створюю простір без осуду для будь-якого досвіду.",
    experienceText:
      "Понад 1500 сесій за тринадцять років практики. Працюю з ветеранами, ЛГБТК+ спільнотою, ВПО та людьми з РХП — з кожною групою окремо проходила профільні курси.",
    therapyStyle:
      "Гнучко поєдную методи залежно від запиту: КПТ і EMDR для травми, гештальт і системну сімейну терапію для стосунків. Головне — темп визначає клієнт, не я.",
    videoUrl: null,
    education: {
      higher: [
        {
          title: "Прикарпатський НУ імені Василя Стефаника",
          speciality: "Психологія",
          years: "2008 – 2013",
          certificateUrls: [cert(1)],
        },
      ],
      courses: [
        {
          title: "EMDR Europe",
          speciality: "EMDR-терапія, акредитація",
          years: "2016 – 2018",
          certificateUrls: [cert(2)],
        },
      ],
      other: [],
    },
    reviews: [],
  },
];
