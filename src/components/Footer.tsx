import React from 'react';
import { useStore } from '../context/StoreContext';
import { BrandMark } from './Navbar';

export const Footer: React.FC = () => {
  const { navigateTo } = useStore();

  const Link: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
    <li>
      <button onClick={() => navigateTo(to)} className="text-[#B9C7BF] hover:text-white hover:underline underline-offset-4">
        {children}
      </button>
    </li>
  );

  return (
    <footer className="bg-[#0A1F19] text-white mt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark size="sm" />
              <span className="font-bold text-lg tracking-tight">Peptides Nepal</span>
            </div>
            <p className="prose-serif mt-4 text-[#B9C7BF] max-w-[38ch]">
              Peptide science in plain language, with the sources, for people in Nepal.
            </p>
            <p className="mt-3 text-sm text-[#B9C7BF] flex flex-wrap gap-x-4 gap-y-1">
              <a href="/guides/" className="hover:text-white hover:underline underline-offset-4">Peptide guides</a>
              <a href="/posts/" className="hover:text-white hover:underline underline-offset-4">All posts</a>
              <a href="/myth-or-fact/" className="hover:text-white hover:underline underline-offset-4">Myth or fact</a>
            </p>
            <a
              href="https://www.instagram.com/peptidesnepal/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-5 px-4 py-2.5 rounded-lg bg-white text-[#0E2A23] font-semibold text-sm hover:bg-[#E4EBE7]"
            >
              Follow @peptidesnepal
            </a>
          </div>

          <nav aria-label="Learn">
            <h2 className="text-sm font-bold text-white">Learn</h2>
            <ul className="mt-3 space-y-2 text-[15px]">
              <Link to="guides">Evidence guides</Link>
              <Link to="quiz">Myth or fact quiz</Link>
              <Link to="lab-results">Lab results</Link>
              <Link to="calculator">Calculator</Link>
            </ul>
          </nav>

          <nav aria-label="Shop">
            <h2 className="text-sm font-bold text-white">Shop</h2>
            <ul className="mt-3 space-y-2 text-[15px]">
              <Link to="shop">All products</Link>
              <Link to="account">Your orders</Link>
              <Link to="support">Delivery and terms</Link>
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-bold text-white">Contact</h2>
            <ul className="mt-3 space-y-2 text-[15px] text-[#B9C7BF]">
              <li><a href="https://wa.me/9779808318864" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline underline-offset-4">WhatsApp +977 980-8318864</a></li>
              <li><a href="mailto:katuwalanup@gmail.com" className="hover:text-white hover:underline underline-offset-4">katuwalanup@gmail.com</a></li>
              <li><button onClick={() => navigateTo('contact')} className="hover:text-white hover:underline underline-offset-4">Send a message</button></li>
            </ul>
          </div>
        </div>

        <p className="mt-12 pt-6 border-t border-white/10 text-[13px] leading-relaxed text-[#8FA79B] max-w-4xl">
          For education and laboratory research reference. Unapproved peptides such as BPC-157, TB-500 and retatrutide are not licensed
          as medicines by Nepal's Department of Drug Administration (DDA) or the US FDA. BPC-157, TB-500, CJC-1295 and ipamorelin are
          prohibited in sport by the World Anti-Doping Agency (WADA). Nothing here is medical advice, diagnosis or treatment.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3 text-[13px] text-[#6F877C]">
          <p>© {new Date().getFullYear()} Peptides Nepal</p>
          <div className="flex gap-5">
            <button onClick={() => navigateTo('privacy')} className="hover:text-white hover:underline">Privacy</button>
            <button onClick={() => navigateTo('support')} className="hover:text-white hover:underline">Support and terms</button>
            <button onClick={() => navigateTo('admin')} className="hover:text-white hover:underline">Admin</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
