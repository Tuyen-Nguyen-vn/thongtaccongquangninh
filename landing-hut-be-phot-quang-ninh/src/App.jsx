import { useState } from 'react';
import {
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ClipboardCheck,
  Droplets,
  HardHat,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Newspaper,
  Phone,
  ShieldCheck,
  Star,
  Toilet,
  Truck,
  Users,
  WalletCards,
  Waves,
  Wind,
  Wrench,
  X,
} from 'lucide-react';
import {
  business,
  faqs,
  footerServices,
  galleryImages,
  heroBadges,
  heroBenefits,
  navItems,
  newsItems,
  pricingCards,
  processSteps,
  proofStats,
  quickBenefits,
  reviews,
  serviceAreas,
  services,
  teamCommitments,
  whyChooseItems,
} from './data.js';
import { allSchemas } from './seo-schema.js';

const iconMap = {
  Clock3,
  Phone,
  WalletCards,
  HardHat,
  Waves,
  Toilet,
  Wind,
  Truck,
  ShieldCheck,
  Wrench,
};

function JsonLd({ schema }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function IconByName({ name, className = '' }) {
  const Icon = iconMap[name] || CheckCircle2;
  return <Icon aria-hidden="true" className={className} />;
}

function CtaButton({ href, children, tone = 'orange', className = '', icon = Phone }) {
  const Icon = icon;
  const toneClass =
    tone === 'green'
      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/20'
      : tone === 'blue'
        ? 'bg-sky-700 text-white hover:bg-sky-800 shadow-sky-900/20'
        : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-900/20';

  return (
    <a
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 py-3 text-center text-sm font-bold shadow-lg transition ${toneClass} ${className}`}
      href={href}
    >
      <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
      <span className="leading-tight">{children}</span>
    </a>
  );
}

function SectionHeader({ eyebrow, title, description, align = 'center' }) {
  const alignClass = align === 'left' ? 'items-start text-left' : 'items-center text-center';
  return (
    <div className={`mx-auto mb-9 flex max-w-3xl flex-col ${alignClass}`}>
      {eyebrow ? (
        <span className="mb-3 inline-flex rounded-full bg-emerald-50 px-4 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-slate-600">{description}</p> : null}
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a className="flex min-w-0 items-center gap-3" href="#top" aria-label="Trang chủ">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-700 to-emerald-600 text-white shadow-md">
            <Droplets aria-hidden="true" className="h-6 w-6" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-black leading-5 text-slate-950 sm:text-base">
              Môi Trường Đô Thị Số 1
            </span>
            <span className="block truncate text-xs font-semibold text-slate-500">Quảng Ninh</span>
          </span>
        </a>

        <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-700 xl:flex" aria-label="Menu chính">
          {navItems.map((item) => (
            <a key={item.href} className="transition hover:text-sky-700" href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <CtaButton href={business.phoneHref} className="min-w-[205px] px-4" icon={Phone}>
            Hotline {business.hotline}
          </CtaButton>
        </div>

        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-900 xl:hidden"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="Mở menu"
        >
          {open ? <X aria-hidden="true" className="h-6 w-6" /> : <Menu aria-hidden="true" className="h-6 w-6" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-100 bg-white px-4 pb-5 shadow-lg xl:hidden">
          <div className="mx-auto grid max-w-7xl gap-2 pt-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                className="rounded-lg px-3 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                href={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <CtaButton href={business.phoneHref} className="mt-2 w-full">
              Hotline {business.hotline}
            </CtaButton>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-emerald-50 pt-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8 lg:pb-20 lg:pt-8">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-700 shadow-sm ring-1 ring-emerald-100">
            Thợ gần khu vực - tiếp nhận 24/7
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Thông Tắc Cống - Hút Bể Phốt Tại Quảng Ninh
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            Thông tắc bồn cầu, xử lý mùi hôi, hút bể phốt theo quy trình rõ ràng - Có mặt nhanh 15-30 phút.
          </p>

          <div className="mt-6 grid gap-3 text-sm font-bold text-slate-700 sm:grid-cols-3">
            {heroBenefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-2 rounded-lg bg-white/80 p-3 shadow-sm ring-1 ring-slate-100">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CtaButton href={business.phoneHref} className="w-full sm:w-auto">
              Gọi ngay {business.hotline}
            </CtaButton>
            <CtaButton href="#lien-he" tone="blue" className="w-full sm:w-auto" icon={MessageCircle}>
              Tư vấn miễn phí
            </CtaButton>
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 shadow-2xl shadow-slate-900/20 ring-1 ring-slate-200">
            <img
              className="h-full min-h-[340px] w-full object-cover sm:min-h-[440px]"
              src="/images/hero-xe-hut-be-phot-quang-ninh.jpg"
              alt="Xe hút bể phốt xanh thi công tại Quảng Ninh"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" aria-hidden="true" />
            <div className="absolute bottom-5 left-5 right-5 grid gap-3 sm:grid-cols-2">
              {heroBadges.map((badge) => (
                <div key={badge} className="rounded-xl bg-white/95 px-4 py-3 text-sm font-black text-slate-950 shadow-lg">
                  {badge}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -right-2 -top-4 hidden rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-lg md:block">
            Hotline {business.hotline}
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickBenefitsSection() {
  return (
    <section className="bg-white py-10">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {quickBenefits.map((item) => (
          <article key={item.title} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <IconByName name={item.icon} className="h-6 w-6" />
            </span>
            <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="dich-vu" className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Dịch vụ"
          title="Dịch Vụ Chính Tại Quảng Ninh"
          description="Tập trung đúng các sự cố thoát nước, bồn cầu, mùi hôi và bể phốt cần xử lý nhanh tại nhà dân, nhà hàng, khách sạn và công trình."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <article key={service.title} className="group overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={service.image} alt={service.alt} loading="lazy" />
                <span className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-sky-700 shadow-md">
                  <IconByName name={service.icon} className="h-6 w-6" />
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-black leading-snug text-slate-950">{service.title}</h3>
                <p className="mt-3 min-h-[120px] text-sm leading-6 text-slate-600">{service.description}</p>
                <a className="mt-5 inline-flex items-center gap-2 text-sm font-black text-orange-600 hover:text-orange-700" href={service.href}>
                  Xem chi tiết
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChooseSection() {
  return (
    <section id="gioi-thieu" className="bg-white py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8">
        <div>
          <SectionHeader
            align="left"
            eyebrow="Lý do chọn"
            title="Vì Sao Chọn Chúng Tôi?"
            description="Quy trình xử lý tập trung vào sạch khu vực, rõ chi phí và hạn chế ảnh hưởng sinh hoạt của khách hàng."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {whyChooseItems.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span className="text-sm font-bold text-slate-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {proofStats.map((stat) => (
              <div key={stat.label} className="rounded-xl bg-sky-700 p-4 text-white">
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wide text-sky-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-200">
          <img
            className="h-full min-h-[360px] w-full object-cover"
            src="/images/doi-ngu-moi-truong-quang-ninh.webp"
            alt="Đội ngũ kỹ thuật môi trường đô thị Quảng Ninh"
            loading="lazy"
          />
          <div className="absolute bottom-4 left-4 rounded-xl bg-white/95 px-4 py-3 shadow-lg">
            <div className="text-sm font-black text-slate-950">Đội kỹ thuật tại Quảng Ninh</div>
            <div className="mt-1 text-xs font-bold text-emerald-700">Đồng phục, máy móc đủ ca xử lý</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Quy trình"
          title="Quy Trình Làm Việc"
          description="Mỗi ca thi công đều đi theo 4 bước để khách hàng biết rõ tình trạng, chi phí và phạm vi bảo hành."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step, index) => (
            <article key={step.title} className="relative rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-lg font-black text-white">
                  {index + 1}
                </span>
                <ClipboardCheck aria-hidden="true" className="h-8 w-8 text-sky-700" />
              </div>
              <h3 className="text-lg font-black text-slate-950">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  return (
    <section id="du-an" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Công trình"
          title="Hình Ảnh Thi Công Thực Tế"
          description="Ảnh xe bồn, kỹ thuật viên và các hạng mục xử lý cống, bồn cầu, đường ống bếp, hố ga tại Quảng Ninh."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {galleryImages.map((image) => (
            <figure key={image.src} className="group overflow-hidden rounded-xl bg-slate-100 shadow-sm ring-1 ring-slate-100">
              <div className="aspect-[4/3] overflow-hidden">
                <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={image.src} alt={image.alt} loading="lazy" />
              </div>
              <figcaption className="bg-white px-4 py-3 text-sm font-bold text-slate-700">{image.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamCommitmentSection() {
  return (
    <section className="bg-sky-950 py-16 text-white sm:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1fr] lg:px-8">
        <div className="overflow-hidden rounded-2xl shadow-2xl shadow-sky-950/40 ring-1 ring-white/10">
          <img
            className="h-full min-h-[330px] w-full object-cover"
            src="/images/doi-ngu-moi-truong-quang-ninh.webp"
            alt="Kỹ thuật viên thông tắc tại Quảng Ninh"
            loading="lazy"
          />
        </div>
        <div>
          <span className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
            Cam kết dịch vụ
          </span>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Đội Ngũ Kỹ Thuật & Cam Kết Dịch Vụ</h2>
          <p className="mt-5 text-base leading-8 text-sky-100">
            Đội ngũ kỹ thuật viên đồng phục gọn gàng, nhiều năm xử lý hiện trường, phục vụ nhanh tại Hạ Long, Cẩm Phả,
            Uông Bí, Móng Cái, Quảng Yên, Đông Triều, Vân Đồn và các khu vực khác tại Quảng Ninh.
          </p>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {teamCommitments.map((item) => (
              <div key={item} className="rounded-xl bg-white p-4 text-center text-sm font-black text-sky-950 shadow-lg">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <CtaButton href={business.phoneHref}>Gọi ngay {business.hotline}</CtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Đánh giá"
          title="Khách Hàng Nói Về Chúng Tôi"
          description="Các phản hồi tập trung vào tốc độ có mặt, cách làm sạch và chi phí được báo trước."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <article key={`${review.name}-${review.area}`} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-4">
                <img className="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-100" src={review.avatar} alt={`${review.name} - ${review.area}`} loading="lazy" />
                <div>
                  <h3 className="font-black text-slate-950">{review.name} - {review.area}</h3>
                  <div className="mt-1 flex gap-0.5 text-amber-400" aria-label={`${review.rating} sao`}>
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <Star key={index} aria-hidden="true" className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm leading-7 text-slate-600">“{review.text}”</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="bang-gia" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Bảng giá"
          title="Bảng Giá Tham Khảo"
          description="Giá thực tế phụ thuộc hiện trạng, đường xe vào, khối lượng và mức độ tắc. Hotline luôn báo rõ trước khi làm."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {pricingCards.map((card) => (
            <article key={card.title} className="rounded-xl border border-slate-100 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <IconByName name={card.icon} className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-black text-slate-950">{card.title}</h3>
              <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600">{card.description}</p>
              <CtaButton href={business.phoneHref} className="mt-5 w-full px-4" icon={Phone}>
                Liên hệ báo giá
              </CtaButton>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-sm font-semibold leading-7 text-slate-600">
          Giá thực tế tùy hiện trạng, vị trí và khối lượng công việc. Vui lòng gọi {business.hotline} để được báo giá nhanh và chính xác.
        </p>
      </div>
    </section>
  );
}

function AreaSection() {
  return (
    <section className="bg-emerald-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Khu vực"
          title="Khu Vực Phục Vụ Tại Quảng Ninh"
          description="Chúng tôi nhận thông tắc cống, thông tắc bồn cầu, xử lý mùi hôi và hút bể phốt tại toàn bộ khu vực Quảng Ninh, hỗ trợ nhanh cả ngày thường, cuối tuần và ngày lễ."
        />
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-3">
          {serviceAreas.map((area) => (
            <span key={area} className="rounded-full bg-white px-4 py-2 text-sm font-black text-emerald-800 shadow-sm ring-1 ring-emerald-100">
              {area}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="FAQ" title="Câu Hỏi Thường Gặp" />
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = active === index;
            return (
              <article key={faq.question} className="rounded-xl border border-slate-100 bg-slate-50 shadow-sm">
                <button
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  type="button"
                  onClick={() => setActive(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                >
                  <h3 className="text-base font-black text-slate-950">{faq.question}</h3>
                  <ChevronDown aria-hidden="true" className={`h-5 w-5 shrink-0 text-slate-500 transition ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen ? <p className="px-5 pb-5 text-sm leading-7 text-slate-600">{faq.answer}</p> : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function NewsSection() {
  return (
    <section id="tin-tuc" className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Tin tức"
          title="Tin Tức / Kiến Thức"
          description="Các hướng dẫn ngắn giúp nhận biết sớm dấu hiệu tắc nghẽn, mùi hôi và bể phốt đầy."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {newsItems.map((item) => (
            <article key={item.title} className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="aspect-[16/10] overflow-hidden">
                <img className="h-full w-full object-cover transition duration-500 hover:scale-105" src={item.image} alt={item.alt} loading="lazy" />
              </div>
              <div className="p-5">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                  <Newspaper aria-hidden="true" className="h-4 w-4" />
                  Kiến thức
                </div>
                <h3 className="text-xl font-black text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                <a className="mt-5 inline-flex items-center gap-2 text-sm font-black text-orange-600 hover:text-orange-700" href={item.href}>
                  Xem thêm
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section id="lien-he" className="bg-sky-800 py-14 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Gọi Ngay Hotline {business.hotline}</h2>
          <p className="mt-3 text-base font-semibold text-sky-100">Có mặt nhanh, xử lý sạch, báo giá minh bạch!</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <CtaButton href={business.phoneHref} className="w-full sm:w-auto">
            Gọi ngay {business.hotline}
          </CtaButton>
          <CtaButton href={business.zaloHref} tone="green" className="w-full sm:w-auto" icon={MessageCircle}>
            Nhắn Zalo
          </CtaButton>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 pb-24 pt-14 text-slate-200 md:pb-8">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr_0.8fr_0.9fr_0.9fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Droplets aria-hidden="true" className="h-6 w-6" />
            </span>
            <h3 className="text-lg font-black text-white">Môi Trường Đô Thị Số 1 Quảng Ninh</h3>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Cung cấp dịch vụ thông tắc cống, thông tắc bồn cầu, hút bể phốt, xử lý mùi hôi tại Quảng Ninh. Rõ giá -
            nhanh - sạch - có bảo hành theo từng hạng mục.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-wide text-white">Thông tin liên hệ</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2"><Phone aria-hidden="true" className="h-5 w-5 text-emerald-400" />Hotline: {business.hotline}</li>
            <li className="flex gap-2"><Mail aria-hidden="true" className="h-5 w-5 text-emerald-400" />{business.email}</li>
            <li className="flex gap-2"><MapPin aria-hidden="true" className="h-5 w-5 text-emerald-400" />{business.address}</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-wide text-white">Liên kết nhanh</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <a className="hover:text-white" href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-wide text-white">Dịch vụ chính</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {footerServices.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-wide text-white">Khu vực phục vụ</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {['Hạ Long', 'Cẩm Phả', 'Uông Bí', 'Móng Cái', 'Quảng Yên', 'Đông Triều', 'Vân Đồn', 'Toàn tỉnh Quảng Ninh'].map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/10 px-4 pt-6 text-xs text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <span>© 2024 Môi Trường Đô Thị Số 1 Quảng Ninh. All rights reserved.</span>
        <a className="hover:text-white" href="https://thongtaccongquangninh.com/author/nguyensonghao/">Tác giả: Nguyễn Song Hào</a>
      </div>
    </footer>
  );
}

function FloatingActions() {
  return (
    <>
      <div className="fixed bottom-5 right-5 z-50 hidden flex-col gap-3 md:flex">
        <a
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-900/25 transition hover:bg-emerald-700"
          href={business.phoneHref}
          aria-label={`Gọi hotline ${business.hotline}`}
        >
          <Phone aria-hidden="true" className="h-6 w-6" />
        </a>
        <a
          className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-700 text-white shadow-lg transition hover:bg-sky-800"
          href="#top"
          aria-label="Lên đầu trang"
        >
          <ArrowUp aria-hidden="true" className="h-5 w-5" />
        </a>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 gap-2 border-t border-slate-200 bg-white/96 p-3 shadow-2xl backdrop-blur md:hidden">
        <a className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-2 text-center text-sm font-black text-white" href={business.phoneHref}>
          <Phone aria-hidden="true" className="h-4 w-4 shrink-0" />
          Gọi ngay
        </a>
        <a className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-sky-700 px-2 text-center text-sm font-black text-white" href={business.zaloHref}>
          <MessageCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
          Zalo
        </a>
        <a className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-orange-500 px-2 text-center text-sm font-black text-white" href="#lien-he">
          <Users aria-hidden="true" className="h-4 w-4 shrink-0" />
          Tư vấn
        </a>
      </div>
    </>
  );
}

export default function App() {
  const shouldRenderClientSchema =
    typeof window === 'undefined' || window.TTCQN_QN_LANDING_DISABLE_CLIENT_SCHEMA !== true;

  return (
    <>
      {shouldRenderClientSchema
        ? allSchemas.map((schema) => <JsonLd key={schema['@id'] || schema['@type']} schema={schema} />)
        : null}
      <Header />
      <main>
        <HeroSection />
        <QuickBenefitsSection />
        <ServicesSection />
        <WhyChooseSection />
        <ProcessSection />
        <GallerySection />
        <TeamCommitmentSection />
        <ReviewsSection />
        <PricingSection />
        <AreaSection />
        <FaqSection />
        <NewsSection />
        <FinalCtaSection />
      </main>
      <Footer />
      <FloatingActions />
    </>
  );
}
