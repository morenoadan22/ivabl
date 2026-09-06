import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { tryoutConfig } from "../data/tryouts.js";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      className={`px-2.5 py-1 rounded-full text-xs font-bold transition border ${copied ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-navy border-black/10 hover:bg-navy hover:text-white"}`}
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

export default function Tryouts() {
  const { fee, teamFee, tryoutDate, tryoutTime, feeNote, locationName, locationAddress, locationCity, contactName, contactEmail, payments, formAction, formSubject } = tryoutConfig;
  const [paymentPref, setPaymentPref] = useState("");

  return (
    <div className="space-y-6">
      {/* Flyer-accurate hero — vintage poster replica */}
      <div className="rounded-[20px] overflow-hidden shadow-xl shadow-black/20 ring-1 ring-black/10">
        {/* Top: Imperial Valley shield + title — navy */}
        <div className="bg-navy-deep px-6 sm:px-8 pt-6 sm:pt-8 pb-6 text-center relative overflow-hidden">
          {/* subtle baseball stitching decoration */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative">
            <div className="inline-flex flex-col items-center">
              <div className="text-gold-light font-display font-black tracking-[0.14em] text-[11px] sm:text-xs border border-gold/40 rounded-full px-3 py-1 bg-white/5">
                IMPERIAL VALLEY
              </div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="h-px w-8 bg-gold/40 hidden sm:block" />
                <span className="font-display font-black text-cream text-sm tracking-[0.12em]">MEN'S BASEBALL LEAGUE</span>
                <span className="h-px w-8 bg-gold/40 hidden sm:block" />
              </div>
            </div>
            <h1 className="font-display font-black leading-none tracking-[-0.02em] mt-4">
              <span className="block text-cream text-[36px] sm:text-[56px] tracking-wide">BASEBALL</span>
              <span className="block text-[#c0392b] text-[44px] sm:text-[68px] -mt-1 sm:-mt-2 drop-shadow-[0_2px_0_rgba(0,0,0,0.3)]">TRYOUTS!</span>
            </h1>
            <p className="text-white/60 text-xs tracking-[0.18em] font-semibold mt-2">COMPETITIVE. FUN. FALL/WINTER BASEBALL.</p>
          </div>
        </div>

        {/* Fee strip — brick red + cream */}
        <div className="grid grid-cols-1 sm:grid-cols-[280px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-white/15">
          <div className="bg-[#9e2b25] px-6 py-4 flex items-center gap-4">
            <span className="h-12 w-12 rounded-full bg-navy-deep text-cream flex items-center justify-center font-black text-xl shrink-0">$</span>
            <div>
              <div className="font-display font-black text-white text-3xl leading-none">${fee}</div>
              <div className="text-white/80 text-xs font-black tracking-[0.14em] -mt-0.5">SIGN UP FEE</div>
            </div>
          </div>
          <div className="bg-cream px-6 py-4 flex items-center">
            <p className="text-[13px] leading-5 font-semibold text-navy">
              SIGN UP FEE WILL GO TOWARDS <span className="text-brick font-black">${teamFee} TEAM FEE</span> ONCE SELECTED OR TEAM IS FORMED.
            </p>
          </div>
        </div>

        {/* Time / Date / Location — cream */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-navy/10 bg-cream">
          <div className="px-6 py-5 text-center">
            <div className="mx-auto h-9 w-9 rounded-full bg-navy-deep text-cream flex items-center justify-center text-sm">◷</div>
            <div className="text-[11px] font-black tracking-[0.16em] text-navy/60 mt-2">TIME</div>
            <div className="font-display font-black text-brick text-xl leading-none mt-1">{tryoutTime}</div>
          </div>
          <div className="px-6 py-5 text-center">
            <div className="mx-auto h-9 w-9 rounded-full bg-[#9e2b25] text-white flex items-center justify-center text-sm">▦</div>
            <div className="text-[11px] font-black tracking-[0.16em] text-navy/60 mt-2">DATE</div>
            <div className="font-display font-black text-brick text-xl leading-none mt-1 uppercase">{tryoutDate}</div>
          </div>
          <div className="px-6 py-5 text-center">
            <div className="mx-auto h-9 w-9 rounded-full bg-navy-deep text-cream flex items-center justify-center text-sm">◎</div>
            <div className="text-[11px] font-black tracking-[0.16em] text-navy/60 mt-2">LOCATION</div>
            <div className="font-display font-black text-brick text-lg leading-none mt-1 uppercase">{locationName}</div>
            <div className="text-xs font-bold text-navy mt-1 leading-tight">{locationAddress}<br />{locationCity}</div>
            <a href={`https://maps.google.com/?q=${encodeURIComponent(`${locationName} ${locationAddress} ${locationCity}`)}`} target="_blank" rel="noreferrer" className="inline-flex mt-2 text-[11px] font-bold text-navy underline hover:text-brick">Open in Maps →</a>
          </div>
        </div>

        {/* Adult League bar — navy */}
        <div className="bg-navy-deep px-6 py-3 flex items-center justify-center gap-3">
          <span className="font-display font-black tracking-[0.16em] text-cream text-sm sm:text-base">ADULT LEAGUE</span>
          <span className="h-2 w-2 rounded-full bg-cream/60" />
          <span className="text-white/60 text-xs font-semibold hidden sm:inline">Wood bat • 18+</span>
        </div>

        {/* Contact + tagline — brick + cream */}
        <div className="bg-[#9e2b25] px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-white font-bold">
            <span className="text-white/80 font-semibold">QUESTIONS?</span> CONTACT <span className="text-white font-black">{contactName.toUpperCase()}</span> TO SIGN UP
          </span>
          <a href={`mailto:${contactEmail}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-navy text-xs font-black hover:bg-cream transition">
            {contactEmail} →
          </a>
        </div>
        <div className="bg-cream px-6 py-2.5 flex items-center justify-center gap-2 border-t border-navy/10">
          <span className="text-[11px] font-black tracking-[0.16em] text-navy/60">COMPETITIVE. FUN. FALL/WINTER BASEBALL.</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <a href="#signup" className="px-6 py-3 rounded-full bg-amber-300 text-navy text-sm font-black hover:bg-amber-200 transition shadow-sm">Save my spot — ${fee}</a>
        <a href="#payments" className="px-6 py-3 rounded-full bg-white border border-black/10 text-navy text-sm font-semibold hover:bg-cream transition">Payment options</a>
        <a href={`mailto:${contactEmail}`} className="px-6 py-3 rounded-full bg-navy text-white text-sm font-semibold hover:bg-navy-deep transition">Questions? Contact {contactName}</a>
      </div>
      <p className="text-xs text-white/60 -mt-3">{feeNote}</p>

      {/* Payments */}
      <div id="payments" className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden scroll-mt-24">
        <div className="px-6 py-5 border-b bg-cream/40 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-black text-navy text-xl">Pay your ${fee} tryout fee</h2>
            <p className="text-sm text-navy/60 mt-1">Pick any option — include your <strong className="text-navy">full name + “Tryout”</strong> in the note so we match it.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest bg-navy text-white px-3 py-1.5 rounded-full">${fee} • ONE TIME → ${teamFee} TEAM FEE IF SELECTED</span>
        </div>
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {payments.map((p) => {
            const isVenmo = p.id === "venmo";
            const isZelle = p.id === "zelle";
            return (
            <div key={p.id} className={`rounded-xl border p-4 flex flex-col ${p.highlight ? "border-gold bg-amber-50/40 ring-1 ring-gold/20" : "border-black/5 bg-white"}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-black tracking-[0.14em] text-navy/60">{p.label.toUpperCase()}</div>
                {p.highlight && <span className="text-[10px] font-black tracking-widest bg-amber-300 text-navy px-2 py-0.5 rounded-full">RECOMMENDED</span>}
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-navy break-all">{p.handle}</span>
                {p.id !== "cash" && <CopyButton text={p.handle} />}
              </div>
              {isVenmo && (
                <div className="mt-4 flex flex-col items-center">
                  <div className="bg-white p-3 rounded-xl border border-black/5 shadow-sm">
                    <QRCodeSVG value="https://venmo.com/Adan-Moreno-1" size={132} bgColor="#ffffff" fgColor="#0f2536" level="M" />
                  </div>
                  <span className="text-[11px] font-semibold text-navy/50 mt-2 tracking-wide">Scan to pay with Venmo</span>
                </div>
              )}
              {isZelle && (
                <div className="mt-4 flex flex-col items-center">
                  <div className="bg-white p-3 rounded-xl border border-black/5 shadow-sm">
                    <img src="/img/zelle-qr.jpeg" alt="Zelle QR — scan in your bank's app to pay ADAN 760-970-7560" className="w-[132px] h-[132px] object-contain block bg-white" loading="lazy" style={{imageRendering:'pixelated'}} onError={(e) => { e.currentTarget.style.display='none'; const fb=e.currentTarget.nextElementSibling; if(fb) fb.style.display='block'; }} />
                    <div style={{display:'none'}}><QRCodeSVG value="760-970-7560" size={132} bgColor="#ffffff" fgColor="#0f2536" level="M" /></div>
                  </div>
                  <span className="text-[11px] font-semibold text-navy/50 mt-2 tracking-wide">Scan to pay with Zelle</span>
                  <span className="text-[11px] text-navy/40">in your bank's app — ADAN xxxxxx7560</span>
                </div>
              )}
              <div className="text-xs text-navy/60 mt-3 leading-relaxed text-center sm:text-left">{p.instructions}</div>
            </div>
            );
          })}
        </div>
        <div className="px-6 pb-6">
          <div className="rounded-xl bg-navy-deep text-white/80 p-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="text-sm">
              <span className="font-bold text-white">After you pay</span> — still fill the form below so we reserve your spot and confirm payment.
            </div>
            <a href="#signup" className="shrink-0 inline-flex justify-center px-5 py-2.5 rounded-full bg-amber-300 text-navy text-sm font-black hover:bg-amber-200 transition">I paid — save my spot</a>
          </div>
        </div>
      </div>

      {/* Signup form */}
      <div id="signup" className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden scroll-mt-24">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-navy to-navy-mid">
          <h2 className="font-display font-black text-white text-xl">Tryout interest — save my spot</h2>
          <p className="text-white/70 text-sm mt-1">{tryoutDate} • {tryoutTime} • {locationName} • ${fee} tryout fee → ${teamFee} team fee if drafted • Season starts Oct 31. We’ll confirm by email/text.</p>
        </div>
        <form action={formAction} method="POST" className="p-4 sm:p-8">
          <input type="hidden" name="_subject" value={formSubject} />
          <input type="hidden" name="season" value="Tryouts — October 17th Sunflower Field — Season Starts Oct 31" />
          <input type="hidden" name="fee" value={`$${fee} tryout → $${teamFee} team fee`} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="sm:col-span-2">
              <div className="text-xs font-black tracking-[0.16em] text-brick border-b border-brick/20 pb-2 mb-1">PLAYER INFO</div>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">First Name *</span>
              <input name="first_name" required placeholder="Juan" className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">Last Name *</span>
              <input name="last_name" required placeholder="Pérez" className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">Email *</span>
              <input name="email" type="email" required placeholder="you@email.com" className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">Phone *</span>
              <input name="phone" type="tel" required placeholder="(760) 555-0100" className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">Primary Position</span>
              <select name="position" defaultValue="" className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold">
                <option value="">Select…</option>
                <option>P</option><option>C</option><option>1B</option><option>2B</option><option>3B</option><option>SS</option><option>OF</option><option>Utility</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">Bats</span>
              <select name="bats" defaultValue="" className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold">
                <option value="">Select…</option>
                <option>R</option><option>L</option><option>Switch</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">Throws</span>
              <select name="throws" defaultValue="" className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold">
                <option value="">Select…</option>
                <option>R</option><option>L</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">Experience Level</span>
              <select name="experience" defaultValue="" className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold">
                <option value="">Select…</option>
                <option>Former HS / College</option>
                <option>Rec / Adult League</option>
                <option>Just getting back</option>
                <option>Beginner</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">Previous IVABL Team (if any)</span>
              <input name="previous_team" placeholder="e.g. Sandlot, Aztecas, new" className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold" />
            </label>

            <div className="sm:col-span-2 mt-2">
              <div className="text-xs font-black tracking-[0.16em] text-gold border-b border-gold/30 pb-2 mb-3">TRYOUT FEE — ${fee} → ${teamFee} TEAM FEE IF SELECTED</div>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">How will you pay the ${fee}? *</span>
              <select name="payment_method" required value={paymentPref} onChange={e => setPaymentPref(e.target.value)} className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold">
                <option value="">Select…</option>
                <option>Venmo — {payments.find(p=>p.id==="venmo")?.handle}</option>
                <option>Zelle — {payments.find(p=>p.id==="zelle")?.handle}</option>
                <option>Cash at check-in</option>
                <option>Need help / other</option>
              </select>
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold tracking-widest text-navy">Anything else? (availability, injuries, etc.)</span>
              <textarea name="message" rows={3} placeholder="Tell us about your game, what you’re looking for, or questions about fees/schedule…" className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold resize-y" />
            </label>

            <label className="sm:col-span-2 inline-flex items-start gap-2 text-sm text-navy/70">
              <input type="checkbox" name="agree_fee" required className="mt-1 h-4 w-4 rounded border-black/20 text-navy focus:ring-gold" />
              <span>I understand the ${fee} tryout fee holds my evaluation spot and will go toward the ${teamFee} team fee if I’m selected / a team is formed.</span>
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button type="submit" className="px-7 py-3 rounded-full bg-navy text-white font-display font-black tracking-widest text-sm hover:bg-navy-deep transition">
              SEND INTEREST →
            </button>
            <span className="text-xs text-navy/50">Questions? <a href={`mailto:${contactEmail}`} className="underline text-navy hover:text-brick">{contactEmail}</a> — contact {contactName}</span>
          </div>

          {paymentPref.includes("Cash at") && (
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
              You selected <strong>Cash at check-in</strong> — please mention it in the message and bring exact $10 to tryouts.
            </div>
          )}
        </form>
      </div>

      {/* FAQ — now flyer-accurate */}
      <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
        <div className="px-6 py-4 border-b bg-cream/40">
          <h3 className="font-display font-black text-navy">FAQ — Tryouts</h3>
        </div>
        <div className="p-4 sm:p-6 grid sm:grid-cols-2 gap-4 text-sm leading-relaxed">
          <div className="rounded-xl border border-black/5 p-4">
            <div className="font-bold text-navy">When and where?</div>
            <div className="text-navy/60 mt-1"><strong className="text-navy">{tryoutDate} • {tryoutTime}</strong> at <strong className="text-navy">{locationName}</strong>, {locationAddress}, {locationCity}. Wood bats, gloves, cleats. We run 60s, BP, infield/outfield, live look.</div>
          </div>
          <div className="rounded-xl border border-black/5 p-4">
            <div className="font-bold text-navy">What does the $10 cover?</div>
            <div className="text-navy/60 mt-1">Field time + evaluation. It goes toward your <strong className="text-navy">${teamFee} team fee</strong> once you’re selected or a team is formed. Season fees due before Week 1.</div>
          </div>
          <div className="rounded-xl border border-black/5 p-4">
            <div className="font-bold text-navy">Who can try out?</div>
            <div className="text-navy/60 mt-1">Adult league — 18+. No team? No problem. Show up, get evaluated, we’ll place you by need & position.</div>
          </div>
          <div className="rounded-xl border border-black/5 p-4">
            <div className="font-bold text-navy">What should I bring?</div>
            <div className="text-navy/60 mt-1">Wood bat, glove, cleats, water. Helmets and baseballs provided. No metal/composite bats — wood only.</div>
          </div>
          <div className="rounded-xl border border-gold/20 bg-amber-50/30 p-4 sm:col-span-2">
            <div className="font-bold text-navy">Contact</div>
            <div className="text-navy/60 mt-1">Questions or to sign up, contact <strong className="text-navy">{contactName}</strong> at <a href={`mailto:${contactEmail}`} className="underline text-navy">{contactEmail}</a>. Digital cash not your thing? Choose “Cash at check-in” and bring $10 to the field.</div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-white/50">
        Summer 2026 stats, standings & schedule remain on the home page — nothing cleared.
      </div>
    </div>
  );
}
