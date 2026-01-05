import { ReactElement, ReactNode } from 'react'
import { render, RenderOptions, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { AuthProvider } from '@/contexts/AuthContext'
import { routeTree } from '@/routeTree.gen'
import type { AuthUser } from '@/types'

/**
 * Интерфейс для опций рендеринга компонентов
 */
interface ComponentRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    // Опции для QueryClient
    queryClientOptions?: {
        defaultOptions?: {
            queries?: any
            mutations?: any
        }
    }

    // Опции для роутера
    routerOptions?: {
        initialEntries?: string[]
        initialIndex?: number
    }

    // Начальное состояние аутентификации
    authState?: {
        isAuthenticated?: boolean
        user?: Partial<AuthUser>
    }

    // Дополнительные провайдеры
    wrapper?: ({ children }: { children: ReactNode }) => ReactElement

    // Пользователь для userEvent
    user?: ReturnType<typeof userEvent.setup>
}

/**
 * Создание тестового QueryClient
 */
function createTestQueryClient(options?: ComponentRenderOptions['queryClientOptions']) {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
                staleTime: 0,
                ...options?.defaultOptions?.queries,
            },
            mutations: {
                retry: false,
                ...options?.defaultOptions?.mutations,
            },
        },
        logger: {
            log: () => { },
            warn: () => { },
            error: () => { },
        },
    })
}

/**
 * Создание тестового роутера
 */
function createTestRouter(options?: ComponentRenderOptions['routerOptions']) {
    const history = createMemoryHistory({
        initialEntries: options?.initialEntries || ['/'],
        initialIndex: options?.initialIndex,
    })

    return createRouter({
        routeTree,
        history,
    })
}

/**
 * Провайдер для всех тестов компонентов
 */
function ComponentTestProvider({
    children,
    queryClient,
    router,
    authState
}: {
    children: ReactNode
    queryClient: QueryClient
    router: any
    authState?: ComponentRenderOptions['authState']
}) {
    // Мокаем начальное состояние аутентификации
    if (authState?.isAuthenticated) {
        // В реальном приложении здесь будет мокирование Zustand store
        const mockUser: AuthUser = {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            avatar: 'https://example.com/avatar.jpg',
            role: 'user',
            accessToken: 'test-token',
            refreshToken: 'test-refresh-token',
            ...authState.user,
        }

        // Мокаем localStorage для аутентификации
        localStorage.setItem('auth-storage', JSON.stringify({
            state: {
                user: mockUser,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            }
        }))
    }

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </QueryClientProvider>
    )
}

/**
 * Кастомная функция рендеринга компонентов с провайдерами
 */
export function renderComponent(
    ui: ReactElement,
    options: ComponentRenderOptions = {}
): RenderResult & {
    queryClient: QueryClient
    router: any
    user: ReturnType<typeof userEvent.setup>
} {
    const {
        queryClientOptions,
        routerOptions,
        authState,
        wrapper,
        user: userOptions,
        ...renderOptions
    } = options

    const queryClient = createTestQueryClient(queryClientOptions)
    const router = createTestRouter(routerOptions)
    const user = userOptions || userEvent.setup()

    const Wrapper = ({ children }: { children: ReactNode }) => {
        const content = (
            <ComponentTestProvider
                queryClient={queryClient}
                router={router}
                authState={authState}
            >
                {children}
            </ComponentTestProvider>
        )

        return wrapper ? wrapper({ children: content }) : content
    }

    const result = render(ui, {
        wrapper: Wrapper,
        ...renderOptions,
    })

    return {
        ...result,
        queryClient,
        router,
        user,
    }
}

/**
 * Утилиты для тестирования форм
 */
export const formTestHelpers = {
    /**
     * Заполнение текстового поля
     */
    fillInput: async (user: ReturnType<typeof userEvent.setup>, input: HTMLElement, value: string) => {
        await user.clear(input)
        await user.type(input, value)
    },

    /**
     * Выбор опции в select
     */
    selectOption: async (user: ReturnType<typeof userEvent.setup>, select: HTMLElement, optionText: string) => {
        await user.selectOptions(select, optionText)
    },

    /**
     * Клик по чекбоксу
     */
    toggleCheckbox: async (user: ReturnType<typeof userEvent.setup>, checkbox: HTMLElement) => {
        await user.click(checkbox)
    },

    /**
     * Отправка формы
     */
    submitForm: async (user: ReturnType<typeof userEvent.setup>, form: HTMLElement) => {
        await user.click(form.querySelector('button[type="submit"]') || form)
    },

    /**
     * Ожидание появления ошибки валидации
     */
    waitForValidationError: async (errorText: string) => {
        return await waitFor(() => {
            expect(screen.getByText(errorText)).toBeInTheDocument()
        })
    },

    /**
     * Проверка, что форма валидна
     */
    expectFormToBeValid: () => {
        const submitButton = screen.getByRole('button', { name: /submit|отправить|сохранить/i })
        expect(submitButton).not.toBeDisabled()
    },

    /**
     * Проверка, что форма невалидна
     */
    expectFormToBeInvalid: () => {
        const submitButton = screen.getByRole('button', { name: /submit|отправить|сохранить/i })
        expect(submitButton).toBeDisabled()
    },
}

/**
 * Утилиты для тестирования навигации
 */
export const navigationTestHelpers = {
    /**
     * Клик по ссылке навигации
     */
    clickNavLink: async (user: ReturnType<typeof userEvent.setup>, linkText: string) => {
        const link = screen.getByRole('link', { name: new RegExp(linkText, 'i') })
        await user.click(link)
    },

    /**
     * Проверка активной ссылки
     */
    expectActiveLinkToBe: (linkText: string) => {
        const link = screen.getByRole('link', { name: new RegExp(linkText, 'i') })
        expect(link).toHaveClass('text-foreground') // или другой класс активной ссылки
    },

    /**
     * Ожидание перехода на страницу
     */
    waitForPageLoad: async (pageTitle: string) => {
        return await waitFor(() => {
            expect(screen.getByText(new RegExp(pageTitle, 'i'))).toBeInTheDocument()
        })
    },
}

/**
 * Утилиты для тестирования аутентификации
 */
export const authTestHelpers = {
    /**
     * Мокирование авторизованного пользователя
     */
    mockAuthenticatedUser: (user?: Partial<AuthUser>) => {
        const mockUser: AuthUser = {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            avatar: 'https://example.com/avatar.jpg',
            role: 'user',
            accessToken: 'test-token',
            refreshToken: 'test-refresh-token',
            ...user,
        }

        localStorage.setItem('auth-storage', JSON.stringify({
            state: {
                user: mockUser,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            }
        }))

        return mockUser
    },

    /**
     * Очистка состояния аутентификации
     */
    clearAuthState: () => {
        localStorage.removeItem('auth-storage')
    },

    /**
     * Проверка отображения информации о пользователе
     */
    expectUserInfoToBeVisible: (userName: string) => {
        expect(screen.getByText(userName)).toBeInTheDocument()
    },

    /**
     * Проверка, что пользователь не авторизован
     */
    expectUserToBeUnauthenticated: () => {
        expect(screen.getByRole('link', { name: /войти/i })).toBeInTheDocument()
    },
}

/**
 * Утилиты для тестирования загрузки данных
 */
export const loadingTestHelpers = {
    /**
     * Ожидание появления индикатора загрузки
     */
    waitForLoadingToAppear: async () => {
        return await waitFor(() => {
            expect(screen.getByText(/загрузка|loading/i)).toBeInTheDocument()
        })
    },

    /**
     * Ожидание исчезновения индикатора загрузки
     */
    waitForLoadingToDisappear: async () => {
        return await waitFor(() => {
            expect(screen.queryByText(/загрузка|loading/i)).not.toBeInTheDocument()
        })
    },

    /**
     * Ожидание появления данных
     */
    waitForDataToLoad: async (dataText: string) => {
        return await waitFor(() => {
            expect(screen.getByText(new RegExp(dataText, 'i'))).toBeInTheDocument()
        })
    },

    /**
     * Ожидание появления ошибки
     */
    waitForErrorToAppear: async (errorText?: string) => {
        return await waitFor(() => {
            const errorElement = errorText
                ? screen.getByText(new RegExp(errorText, 'i'))
                : screen.getByText(/ошибка|error/i)
            expect(errorElement).toBeInTheDocument()
        })
    },
}

/**
 * Утилиты для тестирования модальных окон
 */
export const modalTestHelpers = {
    /**
     * Ожидание открытия модального окна
     */
    waitForModalToOpen: async (modalTitle?: string) => {
        return await waitFor(() => {
            const modal = modalTitle
                ? screen.getByRole('dialog', { name: new RegExp(modalTitle, 'i') })
                : screen.getByRole('dialog')
            expect(modal).toBeInTheDocument()
        })
    },

    /**
     * Закрытие модального окна
     */
    closeModal: async (user: ReturnType<typeof userEvent.setup>) => {
        const closeButton = screen.getByRole('button', { name: /close|закрыть|×/i })
        await user.click(closeButton)
    },

    /**
     * Ожидание закрытия модального окна
     */
    waitForModalToClose: async () => {
        return await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    },
}

/**
 * Утилиты для тестирования списков
 */
export const listTestHelpers = {
    /**
     * Получение всех элементов списка
     */
    getAllListItems: () => {
        return screen.getAllByRole('listitem')
    },

    /**
     * Проверка количества элементов в списке
     */
    expectListToHaveItems: (count: number) => {
        const items = listTestHelpers.getAllListItems()
        expect(items).toHaveLength(count)
    },

    /**
     * Поиск элемента списка по тексту
     */
    findListItemByText: (text: string) => {
        return screen.getByRole('listitem', { name: new RegExp(text, 'i') })
    },

    /**
     * Клик по элементу списка
     */
    clickListItem: async (user: ReturnType<typeof userEvent.setup>, text: string) => {
        const item = listTestHelpers.findListItemByText(text)
        await user.click(item)
    },
}

/**
 * Кастомные матчеры для тестирования
 */
export const customMatchers = {
    /**
     * Проверка видимости элемента
     */
    toBeVisible: (element: HTMLElement) => {
        return element.offsetParent !== null && !element.hidden
    },

    /**
     * Проверка фокуса на элементе
     */
    toHaveFocus: (element: HTMLElement) => {
        return document.activeElement === element
    },

    /**
     * Проверка наличия CSS класса
     */
    toHaveClass: (element: HTMLElement, className: string) => {
        return element.classList.contains(className)
    },

    /**
     * Проверка значения атрибута
     */
    toHaveAttribute: (element: HTMLElement, attribute: string, value?: string) => {
        const hasAttribute = element.hasAttribute(attribute)
        if (value === undefined) {
            return hasAttribute
        }
        return hasAttribute && element.getAttribute(attribute) === value
    },
}

/**
 * Утилиты для отладки тестов
 */
export const debugHelpers = {
    /**
     * Вывод текущего DOM дерева
     */
    logDOM: () => {
        screen.debug()
    },

    /**
     * Вывод конкретного элемента
     */
    logElement: (element: HTMLElement) => {
        screen.debug(element)
    },

    /**
     * Поиск элементов по тексту (для отладки)
     */
    findByText: (text: string) => {
        try {
            return screen.getByText(new RegExp(text, 'i'))
        } catch (error) {
            console.log(`Element with text "${text}" not found`)
            screen.debug()
            throw error
        }
    },

    /**
     * Список всех доступных ролей
     */
    logAllRoles: () => {
        const roles = [
            'button', 'link', 'textbox', 'checkbox', 'radio', 'combobox',
            'listbox', 'option', 'menuitem', 'tab', 'tabpanel', 'dialog',
            'alertdialog', 'alert', 'status', 'log', 'marquee', 'timer',
            'heading', 'list', 'listitem', 'table', 'row', 'cell',
            'columnheader', 'rowheader', 'grid', 'gridcell', 'tree',
            'treeitem', 'group', 'img', 'figure', 'article', 'banner',
            'complementary', 'contentinfo', 'form', 'main', 'navigation',
            'region', 'search'
        ]

        roles.forEach(role => {
            try {
                const elements = screen.getAllByRole(role as any)
                console.log(`${role}: ${elements.length} elements`)
            } catch (error) {
                // Роль не найдена
            }
        })
    },
}

// Экспортируем все необходимые утилиты
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
export { waitFor, screen } from '@testing-library/react'