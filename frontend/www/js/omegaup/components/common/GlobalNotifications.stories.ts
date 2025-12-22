import { Meta, StoryObj } from '@storybook/vue';
import Vue from 'vue';
import Vuex from 'vuex';
import {
  createNotificationsStore,
  MessageType,
  NotificationPosition,
} from '../../notificationsStore';
import GlobalNotifications from './GlobalNotifications.vue';

Vue.use(Vuex);

/**
 * GlobalNotifications displays platform-wide notification messages
 * (error, success, warning, info) with smooth slide animations.
 *
 * The component reads state from a Vuex store and supports multiple
 * position variants for flexible placement.
 */
const meta: Meta<typeof GlobalNotifications> = {
  component: GlobalNotifications,
  title: 'Components/GlobalNotifications',
  parameters: {
    docs: {
      description: {
        component:
          'A reusable notification component that displays error, success, warning, and info messages. Uses Vuex store for state management and CSS transitions for animations.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Helper to create a story with specific notification state
function createNotificationStory(
  message: string,
  type: MessageType,
  position: NotificationPosition = NotificationPosition.Top,
): Story {
  return {
    render: () => ({
      components: { GlobalNotifications },
      template: '<global-notifications />',
      beforeCreate() {
        const store = createNotificationsStore();
        store.dispatch('displayStatus', {
          message,
          type,
          position,
          autoHide: false, // Prevent auto-hide in stories
        });

        // Mock the default export to use our custom store
        jest.mock('../../notificationsStore', () => ({
          ...jest.requireActual('../../notificationsStore'),
          default: store,
        }));
      },
    }),
  };
}

/**
 * Error notification with red/danger styling.
 * Used for displaying error messages and failures.
 */
export const Error: Story = {
  render: () => ({
    components: { GlobalNotifications },
    template: '<global-notifications />',
    beforeCreate() {
      const store = createNotificationsStore();
      store.dispatch('displayStatus', {
        message: 'An error occurred while processing your request.',
        type: MessageType.Danger,
        autoHide: false,
      });
      // Replace the module-level store
      Object.assign(require('../../notificationsStore').default, store.state);
    },
  }),
};
Error.storyName = 'Error Notification';

/**
 * Success notification with green styling.
 * Used for confirming successful operations.
 */
export const Success: Story = {
  render: () => ({
    components: { GlobalNotifications },
    template: '<global-notifications />',
    beforeCreate() {
      const store = createNotificationsStore();
      store.dispatch('displayStatus', {
        message: 'Your changes have been saved successfully!',
        type: MessageType.Success,
        autoHide: false,
      });
      Object.assign(require('../../notificationsStore').default, store.state);
    },
  }),
};
Success.storyName = 'Success Notification';

/**
 * Warning notification with yellow/orange styling.
 * Used for alerting users to potential issues.
 */
export const Warning: Story = {
  render: () => ({
    components: { GlobalNotifications },
    template: '<global-notifications />',
    beforeCreate() {
      const store = createNotificationsStore();
      store.dispatch('displayStatus', {
        message: 'Your session will expire in 5 minutes.',
        type: MessageType.Warning,
        autoHide: false,
      });
      Object.assign(require('../../notificationsStore').default, store.state);
    },
  }),
};
Warning.storyName = 'Warning Notification';

/**
 * Info notification with blue styling.
 * Used for general informational messages.
 */
export const Info: Story = {
  render: () => ({
    components: { GlobalNotifications },
    template: '<global-notifications />',
    beforeCreate() {
      const store = createNotificationsStore();
      store.dispatch('displayStatus', {
        message: 'A new version of the platform is available.',
        type: MessageType.Info,
        autoHide: false,
      });
      Object.assign(require('../../notificationsStore').default, store.state);
    },
  }),
};
Info.storyName = 'Info Notification';

/**
 * Notification positioned at bottom-right corner.
 * Demonstrates the toast-style positioning option.
 */
export const BottomRight: Story = {
  render: () => ({
    components: { GlobalNotifications },
    template: '<div style="height: 200px;"><global-notifications /></div>',
    beforeCreate() {
      const store = createNotificationsStore();
      store.dispatch('displayStatus', {
        message: 'This is a toast-style notification',
        type: MessageType.Success,
        position: NotificationPosition.BottomRight,
        autoHide: false,
      });
      Object.assign(require('../../notificationsStore').default, store.state);
    },
  }),
};
BottomRight.storyName = 'Bottom Right Position';

/**
 * Notification positioned at top-right corner.
 */
export const TopRight: Story = {
  render: () => ({
    components: { GlobalNotifications },
    template: '<div style="height: 200px;"><global-notifications /></div>',
    beforeCreate() {
      const store = createNotificationsStore();
      store.dispatch('displayStatus', {
        message: 'Top-right positioned notification',
        type: MessageType.Info,
        position: NotificationPosition.TopRight,
        autoHide: false,
      });
      Object.assign(require('../../notificationsStore').default, store.state);
    },
  }),
};
TopRight.storyName = 'Top Right Position';
