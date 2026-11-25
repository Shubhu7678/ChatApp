import { useEffect, useRef, useState } from 'react';
import Onboarding from './components/Onboarding';
import LocationGate from './components/LocationGate';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import ProfileDialog from './components/ProfileDialog';
import useGeolocation from './hooks/useGeolocation';
import useChat from './hooks/useChat';
import useNotifications from './hooks/useNotifications';
import { loadProfile, saveName, saveProfile } from './lib';

const TITLE = 'Nearby Chat';

export default function App() {
  const [profile, setProfile] = useState(loadProfile);
  if (!profile.name) {
    return <Onboarding onDone={(name) => { saveName(name); setProfile((p) => ({ ...p, name })); }} />;
  }
  return <Chat profile={profile} onProfileChange={(p) => setProfile((cur) => ({ ...cur, ...p }))} />;
}

function Chat({ profile, onProfileChange }) {
  const { coords, status, retry } = useGeolocation(true);
  const notif = useNotifications();
  const activeKey = useRef('public');

  const chat = useChat(profile, coords, (msg, key) => {
    const viewing = !document.hidden && activeKey.current === key;
    if (viewing) return;
    notif.beep();
    notif.show({
      title: key === 'public' ? `${msg.from.name} in Everyone nearby` : msg.from.name,
      body: msg.text,
      tag: key,
    });
  });
  activeKey.current = chat.active;

  // On mobile the list and the chat are separate screens.
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const totalUnread = Object.values(chat.unread).reduce((a, b) => a + b, 0);
  useEffect(() => {
    document.title = totalUnread ? `(${totalUnread}) ${TITLE}` : TITLE;
  }, [totalUnread]);

  if (status !== 'ok') return <LocationGate status={status} onRetry={retry} />;

  if (chat.replaced) {
    return (
      <main className="flex min-h-full items-center justify-center p-5 text-center">
        <p className="max-w-xs text-sm text-mute">Nearby is open in another tab, so this one was disconnected. Reload to use it here instead.</p>
      </main>
    );
  }

  const { active } = chat;
  const isPublic = active === 'public';
  const nearbyPeer = chat.nearby.find((u) => u.id === active);
  const open = (key) => { chat.open(key); setShowChat(true); };

  const saveMyProfile = async (p) => {
    const res = await chat.updateProfile(p);
    if (res.ok !== false) { saveProfile(p); onProfileChange(p); }
    return res;
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className={`${showChat ? 'hidden' : 'block'} h-full w-full md:block md:w-80 md:shrink-0 lg:w-96`}>
        <Sidebar
          me={profile} nearby={chat.nearby} connected={chat.connected} active={active} unread={chat.unread} onOpen={open}
          radius={chat.radius} limits={chat.limits} onRadius={chat.setRadius} blocked={chat.blocked} onUnblock={chat.unblock}
          onProfile={() => setShowProfile(true)}
        />
      </div>
      <div className={`${showChat ? 'block' : 'hidden'} h-full min-w-0 flex-1 md:block`}>
        <ChatPanel
          threadKey={active}
          me={profile}
          peer={isPublic ? null : nearbyPeer || chat.peers[active]}
          nearbyPeer={nearbyPeer}
          messages={isPublic ? chat.publicMsgs : chat.dms[active] || []}
          connected={chat.connected}
          radius={chat.radius}
          blocked={chat.blocked}
          typing={chat.typing}
          reactions={chat.reactions}
          onSend={chat.send}
          onBack={() => setShowChat(false)}
          onTyping={chat.sendTyping}
          onReact={(msgId, scope, emoji) => chat.react(msgId, scope, emoji)}
          onBlock={chat.block}
          onReport={(user, text) => chat.report(user, text, 'message')}
        />
      </div>
      {showProfile && <ProfileDialog profile={profile} notif={notif} onSave={saveMyProfile} onClose={() => setShowProfile(false)} />}
    </div>
  );
}
