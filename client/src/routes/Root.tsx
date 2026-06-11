import { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { Outlet } from 'react-router-dom';
import { useMediaQuery } from '@librechat/client';
import {
  useSearchEnabled,
  useAssistantsMap,
  useAuthContext,
  useAgentsMap,
  useFileMap,
} from '~/hooks';
import store from '~/store';
import {
  PromptGroupsProvider,
  AssistantsMapContext,
  AgentsMapContext,
  SetConvoProvider,
  FileMapContext,
} from '~/Providers';
import { useUserTermsQuery, useGetStartupConfig } from '~/data-provider';
import { UnifiedSidebar } from '~/components/UnifiedSidebar';
import { TermsAndConditionsModal, ChangelogModal, getSeenVersion } from '~/components/ui';
import { useHealthCheck } from '~/data-provider';
import { Banner } from '~/components/Banners';

interface ChangelogData {
  version: string;
  entries: { version: string; date: string; title: string; changes: string[] }[];
}

export default function Root() {
  const [showTerms, setShowTerms] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [changelogData, setChangelogData] = useState<ChangelogData | null>(null);
  const [bannerHeight, setBannerHeight] = useState(0);
  const sidebarExpanded = useRecoilValue(store.sidebarExpanded);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  const { isAuthenticated, logout } = useAuthContext();

  useHealthCheck(isAuthenticated);

  const assistantsMap = useAssistantsMap({ isAuthenticated });
  const agentsMap = useAgentsMap({ isAuthenticated });
  const fileMap = useFileMap({ isAuthenticated });

  const { data: config } = useGetStartupConfig();
  const { data: termsData } = useUserTermsQuery({
    enabled: isAuthenticated && config?.interface?.termsOfService?.modalAcceptance === true,
  });

  useSearchEnabled(isAuthenticated);

  useEffect(() => {
    if (termsData) {
      setShowTerms(!termsData.termsAccepted);
    }
  }, [termsData]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fetch('/changelog.json')
      .then((res) => res.json())
      .then((data: ChangelogData) => {
        setChangelogData(data);
        const seen = getSeenVersion();
        if (seen !== data.version) {
          setShowChangelog(true);
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleAcceptTerms = () => {
    setShowTerms(false);
  };

  const handleDeclineTerms = () => {
    setShowTerms(false);
    logout('/login?redirect=false');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SetConvoProvider>
      <FileMapContext.Provider value={fileMap}>
        <AssistantsMapContext.Provider value={assistantsMap}>
          <AgentsMapContext.Provider value={agentsMap}>
            <PromptGroupsProvider>
              <Banner onHeightChange={setBannerHeight} />
              <div className="flex" style={{ height: `calc(100dvh - ${bannerHeight}px)` }}>
                <div className="relative z-0 flex h-full w-full overflow-hidden">
                  <UnifiedSidebar />
                  <div
                    className="relative flex h-full max-w-full flex-1 flex-col overflow-hidden"
                    style={{
                      transform:
                        isSmallScreen && sidebarExpanded ? 'translateX(min(85vw, 380px))' : 'none',
                      transition: 'transform 300ms cubic-bezier(0.2, 0, 0, 1)',
                    }}
                    inert={isSmallScreen && sidebarExpanded ? '' : undefined}
                  >
                    <Outlet />
                  </div>
                </div>
              </div>
            </PromptGroupsProvider>
          </AgentsMapContext.Provider>
          {config?.interface?.termsOfService?.modalAcceptance === true && (
            <TermsAndConditionsModal
              open={showTerms}
              onOpenChange={setShowTerms}
              onAccept={handleAcceptTerms}
              onDecline={handleDeclineTerms}
              title={config.interface.termsOfService.modalTitle}
              modalContent={config.interface.termsOfService.modalContent}
            />
          )}
          {changelogData && (
            <ChangelogModal
              open={showChangelog}
              onOpenChange={setShowChangelog}
              data={changelogData}
            />
          )}
        </AssistantsMapContext.Provider>
      </FileMapContext.Provider>
    </SetConvoProvider>
  );
}
