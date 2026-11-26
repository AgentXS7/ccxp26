import type React from 'react';
import { useEffect, useState } from 'react';
import { Camera, Check, KeyRound, Lock, LogOut, ShieldCheck, Trash2, X } from 'lucide-react';
import { GROUP_MEMBERS } from '../../data/members';
import { compressAvatarImage } from '../../lib/utils';
import type { GroupMemberId, MemberCloudProfile } from '../../types';
import { AnimeDislikeIcon, AnimeHeartIcon, AnimeLikeIcon } from '../ui/AnimeDecor';
import { HoyoDialog } from '../ui/HoyoDialog';
import { UserAvatar } from '../ui/UserAvatar';

interface VoterNameModalProps {
  open: boolean;
  onClose: () => void;
  activeMemberId: GroupMemberId | null;
  activeMemberName: string;
  deviceToken: string;
  memberProfiles: Partial<Record<GroupMemberId, MemberCloudProfile>>;
  avatarPhoto?: string;
  onSelectFreeMember: (memberId: GroupMemberId) => void;
  onAuthorizeMemberWithCode: (memberId: GroupMemberId, code: string) => boolean;
  onUpdateAvatarPhoto: (photo: string | undefined) => void;
  onLeaveDevice: () => void;
}

export function VoterNameModal({
  open,
  onClose,
  activeMemberId,
  activeMemberName,
  deviceToken,
  memberProfiles,
  avatarPhoto,
  onSelectFreeMember,
  onAuthorizeMemberWithCode,
  onUpdateAvatarPhoto,
  onLeaveDevice,
}: VoterNameModalProps) {
  const [photoError, setPhotoError] = useState('');
  const [unlockTargetId, setUnlockTargetId] = useState<GroupMemberId | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');

  useEffect(() => {
    if (!open) {
      setUnlockTargetId(null);
      setCodeInput('');
      setCodeError('');
      setPhotoError('');
    }
  }, [open]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoError('');
    try {
      const compressed = await compressAvatarImage(file, 96, 0.72);
      onUpdateAvatarPhoto(compressed);
    } catch {
      setPhotoError('Não deu para carregar essa imagem. Tente outra foto.');
    }
  };

  const activeProfile = activeMemberId ? memberProfiles[activeMemberId] : undefined;

  const handleCodeSubmit = (e: React.FormEvent, memberId: GroupMemberId) => {
    e.preventDefault();
    const ok = onAuthorizeMemberWithCode(memberId, codeInput.trim());
    if (!ok) {
      setCodeError('Código incorreto. Confira os 4 dígitos no seu outro celular ou peça liberação no Admin.');
      return;
    }
    setUnlockTargetId(null);
    setCodeInput('');
    setCodeError('');
  };

  return (
    <HoyoDialog
      open={open}
      onClose={onClose}
      ariaLabelledBy="voterDialogTitle"
      maxWidthClass="sm:max-w-md"
    >
      <div className="p-5 sm:p-6 pb-8 sm:pb-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3
            id="voterDialogTitle"
            className="text-base font-extrabold text-white flex items-center gap-2"
          >
            <UserAvatar
              photo={avatarPhoto}
              name={activeMemberName}
              sizeClass="w-7 h-7"
              textClass="text-xs"
            />
            <span>{activeMemberId ? `Perfil de ${activeMemberName}` : 'Quem é você no grupo?'}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-[#9BA3C2] hover:text-white p-1 rounded-xl bg-[#212847]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!activeMemberId ? (
          <div className="space-y-3">
            <p className="text-xs text-[#9BA3C2] leading-relaxed">
              Toque no seu nome para travar o perfil neste celular. Seus votos (
              <AnimeLikeIcon className="w-3.5 h-3.5" /> / <AnimeDislikeIcon className="w-3.5 h-3.5" />), curtidas (
              <AnimeHeartIcon className="w-3.5 h-3.5" />), foto, gastos e roteiro ficam salvos pra você!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GROUP_MEMBERS.map((member) => {
                const cloud = memberProfiles[member.id];
                const trusted = cloud?.trustedDevices || [];
                const isAuthorizedHere = trusted.includes(deviceToken);
                const isLockedElsewhere = trusted.length > 0 && !isAuthorizedHere;
                const showCodeBox = unlockTargetId === member.id;

                return (
                  <div
                    key={member.id}
                    className={`rounded-2xl p-3 border space-y-2.5 transition ${
                      isLockedElsewhere
                        ? 'bg-[#12162A] border-[#8596D6]/20'
                        : 'hoyo-card-inner hover:border-[#E5B869]/55'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar
                          photo={cloud?.avatarPhoto || undefined}
                          name={member.name}
                          sizeClass="w-10 h-10"
                          textClass="text-sm"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-white truncate">
                            {member.name}
                          </p>
                          <p className="text-[10px] font-semibold text-[#9BA3C2]">
                            {isAuthorizedHere
                              ? 'Autorizado aqui'
                              : isLockedElsewhere
                              ? '🔒 Em uso em outro celular'
                              : 'Disponível'}
                          </p>
                        </div>
                      </div>

                      {!isLockedElsewhere ? (
                        <button
                          type="button"
                          onClick={() => onSelectFreeMember(member.id)}
                          className="hoyo-accent-btn text-xs font-extrabold px-3 py-1.5 rounded-xl shrink-0 transition"
                        >
                          {isAuthorizedHere ? 'Entrar' : 'Sou eu'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setUnlockTargetId(showCodeBox ? null : member.id);
                            setCodeInput('');
                            setCodeError('');
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-[#1F2644] border border-[#8596D6]/30 text-[#CAD4FF] hover:text-white shrink-0"
                        >
                          <Lock className="w-3 h-3 text-[#E5B869]" />
                          <span>Entrar</span>
                        </button>
                      )}
                    </div>

                    {showCodeBox && isLockedElsewhere && (
                      <form
                        onSubmit={(e) => handleCodeSubmit(e, member.id)}
                        className="pt-2 border-t border-[#8596D6]/15 space-y-2 animate-fade-in"
                      >
                        <p className="text-[10px] text-[#CBD2EC]">
                          É você em outro aparelho? Digite seu código de 4 dígitos:
                        </p>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            required
                            autoFocus
                            value={codeInput}
                            onChange={(e) => {
                              setCodeInput(e.target.value.replace(/\D/g, '').slice(0, 4));
                              setCodeError('');
                            }}
                            placeholder="0000"
                            className="w-24 bg-[#14192D] border border-[#657EF8] rounded-xl px-2.5 py-1.5 text-xs font-bold tracking-widest text-center text-white focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="flex-1 hoyo-accent-btn text-[11px] font-extrabold py-1.5 px-2.5 rounded-xl"
                          >
                            Liberar
                          </button>
                        </div>
                        {codeError && (
                          <p className="text-[10px] text-[#FFB5B5] leading-snug">{codeError}</p>
                        )}
                        <p className="text-[10px] text-[#8F97B8]">
                          Esqueceu? Peça para o Max liberar na aba Admin.
                        </p>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Nome travado */}
            <div className="rounded-2xl hoyo-card-inner border-[#47C5B8]/35 p-3.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <ShieldCheck className="w-5 h-5 text-[#47C5B8] shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-white truncate">
                    {activeMemberName}
                  </p>
                  <p className="text-[11px] text-[#8AE5DB]">
                    Perfil travado neste aparelho • Foto e dados sincronizados
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-[#47C5B8]/15 text-[#8AE5DB] border border-[#47C5B8]/30 shrink-0">
                <Check className="w-3 h-3" /> Ativo
              </span>
            </div>

            {/* Foto de Perfil Opcional */}
            <div className="rounded-2xl hoyo-card-inner p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar
                  photo={avatarPhoto}
                  name={activeMemberName}
                  sizeClass="w-12 h-12"
                  textClass="text-lg"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white">Sua Foto de Perfil</p>
                  <p className="text-[11px] text-[#9BA3C2]">
                    {avatarPhoto ? 'Aparece para todo o grupo' : 'Opcional (senão usa sua inicial)'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold hoyo-accent-pill border px-2.5 py-1.5 rounded-xl hover:border-[#E5B869]/60 transition">
                  <Camera className="w-3.5 h-3.5" />
                  <span>{avatarPhoto ? 'Trocar' : 'Foto'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>

                {avatarPhoto && (
                  <button
                    type="button"
                    onClick={() => onUpdateAvatarPhoto(undefined)}
                    title="Remover foto"
                    aria-label="Remover foto"
                    className="p-1.5 rounded-xl bg-[#EC6B6B]/15 border border-[#EC6B6B]/35 text-[#FFB5B5] hover:bg-[#EC6B6B]/25 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {photoError && (
              <p className="text-[11px] text-[#FFB5B5] font-medium">{photoError}</p>
            )}

            {/* Código de 4 dígitos para abrir em outro aparelho */}
            {activeProfile?.transferCode && (
              <div className="rounded-2xl hoyo-card-inner p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <KeyRound className="w-4 h-4 text-[#E5B869] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">Código para outro celular / PC</p>
                    <p className="text-[10px] text-[#9BA3C2] leading-snug">
                      Se abrir o app em outro aparelho, digite esse código para puxar sua foto, extras e roteiro.
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-base font-black tracking-widest px-3 py-1.5 rounded-xl bg-[#1F2644] border border-[#E5B869]/45 text-[#F6D794]">
                  {activeProfile.transferCode}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onLeaveDevice}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl bg-[#212847] hover:bg-[#2B3359] text-xs font-bold text-[#CBD2EC] transition"
                title="Desconectar este perfil deste aparelho"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair daqui</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 hoyo-accent-btn font-extrabold text-xs py-3 rounded-xl transition"
              >
                Pronto
              </button>
            </div>
          </div>
        )}
      </div>
    </HoyoDialog>
  );
}
