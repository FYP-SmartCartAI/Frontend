import { Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import SubadminSidebar from './SubadminSidebar'
import Header from './Header'
import SubadminCityPrompt from './SubadminCityPrompt'
import Spinner from '../ui/Spinner'
import { selectMobileSidebar, closeMobileSidebar, toggleMobileSidebar } from '../../store/slices/uiSlice'
import { selectCurrentUser, selectToken } from '../../store/slices/authSlice'
import { useGetProfileQuery } from '../../store/api/authApi'
import { subadminNeedsCity } from '../../utils/subadminHelpers'
import { isTokenExpired } from '../../utils/tokenHelpers'

export default function SubadminLayout() {
  const dispatch   = useDispatch()
  const mobileOpen = useSelector(selectMobileSidebar)
  const user       = useSelector(selectCurrentUser)
  const token      = useSelector(selectToken)

  const isSubadmin = user?.role === 'subadmin'
  const skipProfile = !isSubadmin || !token || isTokenExpired(token)

  const { data: profileData, isLoading, isFetching, isSuccess } = useGetProfileQuery(
    undefined,
    { skip: skipProfile },
  )

  // Prefer fresh profile city over stale cached login payload
  const effectiveUser = profileData?.user
    ? { ...user, ...profileData.user }
    : user

  const isCheckingCity = isSubadmin && !skipProfile && (isLoading || isFetching) && !isSuccess
  const needsCity      = subadminNeedsCity(effectiveUser)

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      <SubadminSidebar
        isOpen={mobileOpen}
        onClose={() => dispatch(closeMobileSidebar())}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => dispatch(toggleMobileSidebar())} title="Operations" />
        <main className="flex-1 overflow-y-auto">
          {isCheckingCity ? (
            <div className="flex items-center justify-center h-full">
              <Spinner size="lg" />
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      {!isCheckingCity && needsCity && <SubadminCityPrompt />}
    </div>
  )
}
