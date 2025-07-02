import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
} from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  template: `
    @if (visible()) {
    <div class="toast">
      {{ message() }}
    </div>
    }
  `,
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ToastComponent {
  private toast = inject(ToastService);
  message = computed(() => this.toast.message);
  visible = computed(() => this.toast.visible);
}
