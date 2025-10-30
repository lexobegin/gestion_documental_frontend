import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsultaCreate } from '../../../models/consulta/consulta.model';
import { ConsultaService } from '../../../services/consulta/consulta.service';

// Interface para el reconocimiento de voz
interface SpeechRecognition extends EventTarget {
  start(): void;
  stop(): void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

@Component({
  selector: 'app-consulta-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consulta-create.component.html',
})
export class ConsultaCreateComponent implements OnInit {
  @ViewChild('diagnosticoTextarea') diagnosticoTextarea!: ElementRef;
  @ViewChild('tratamientoTextarea') tratamientoTextarea!: ElementRef;
  @ViewChild('observacionesTextarea') observacionesTextarea!: ElementRef;

  consulta: ConsultaCreate = {
    historia_clinica: 0,
    medico: 0,
    motivo_consulta: '',
    sintomas: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
  };

  // Estados
  enviando: boolean = false;
  error: string | undefined;

  // Reconocimiento de voz
  reconocimiento: SpeechRecognition | null = null;
  grabando: boolean = false;
  textoTranscrito: string = '';
  campoActivo: 'diagnostico' | 'tratamiento' | 'observaciones' | 'ninguno' =
    'ninguno';
  mostrarPanelVoz: boolean = false;

  // Datos del paciente desde la cita
  pacienteId: number = 0;
  pacienteNombre: string = '';
  pacienteApellido: string = '';
  medicoId: number = 0;
  citaId: number = 0;

  // Comandos de voz
  private comandos = {
    diagnóstico: 'diagnostico',
    diagnostico: 'diagnostico',
    tratamiento: 'tratamiento',
    observaciones: 'observaciones',
    observación: 'observaciones',
    fin: 'fin',
    terminar: 'fin',
    detener: 'fin',
  };

  constructor(
    private consultaService: ConsultaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerDatosDesdeURL();
    this.inicializarReconocimientoVoz();
  }

  obtenerDatosDesdeURL(): void {
    this.route.queryParams.subscribe((params) => {
      this.pacienteId = +params['paciente_id'] || 0;
      this.pacienteNombre = params['paciente_nombre'] || '';
      this.pacienteApellido = params['paciente_apellido'] || '';
      this.medicoId = +params['medico_id'] || 0;
      this.citaId = +params['cita_id'] || 0;

      // Asignar datos básicos
      this.consulta.medico = this.medicoId;
      // Aquí deberías buscar la historia_clínica del paciente
      // Por ahora usamos un valor temporal
      this.consulta.historia_clinica = this.pacienteId;
    });
  }

  inicializarReconocimientoVoz(): void {
    if (
      !('webkitSpeechRecognition' in window) &&
      !('SpeechRecognition' in window)
    ) {
      console.warn(
        'El reconocimiento de voz no es compatible con este navegador'
      );
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.reconocimiento = new SpeechRecognition();

    // CORRECCIÓN: Verificar que reconocimiento no sea null
    if (this.reconocimiento) {
      this.reconocimiento.continuous = true;
      this.reconocimiento.interimResults = true;
      this.reconocimiento.lang = 'es-ES';

      this.reconocimiento.onresult = (event: any) => {
        let textoFinal = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            textoFinal += event.results[i][0].transcript;
          }
        }

        if (textoFinal) {
          this.procesarTranscripcion(textoFinal);
        }
      };

      this.reconocimiento.onerror = (event: any) => {
        console.error('Error en reconocimiento de voz:', event.error);
        this.error = `Error de reconocimiento: ${event.error}`;
        this.detenerGrabacion();
      };

      this.reconocimiento.onend = () => {
        if (this.grabando) {
          // Reiniciar si se detuvo inesperadamente
          this.iniciarGrabacion();
        }
      };
    }
  }

  // Procesar la transcripción y detectar comandos
  procesarTranscripcion(texto: string): void {
    const textoLimpio = texto.toLowerCase().trim();

    // Detectar comandos
    for (const [comando, accion] of Object.entries(this.comandos)) {
      if (textoLimpio.includes(comando)) {
        this.ejecutarComando(accion, textoLimpio);
        return;
      }
    }

    // Si no es un comando, agregar al campo activo
    this.agregarTextoACampoActivo(texto);
  }

  ejecutarComando(comando: string, textoCompleto: string): void {
    switch (comando) {
      case 'diagnostico':
        this.campoActivo = 'diagnostico';
        this.textoTranscrito = 'Diagnóstico: ';
        this.mostrarFeedbackVoz('Modo diagnóstico activado');
        break;

      case 'tratamiento':
        this.campoActivo = 'tratamiento';
        this.textoTranscrito = 'Tratamiento: ';
        this.mostrarFeedbackVoz('Modo tratamiento activado');
        break;

      case 'observaciones':
        this.campoActivo = 'observaciones';
        this.textoTranscrito = 'Observaciones: ';
        this.mostrarFeedbackVoz('Modo observaciones activado');
        break;

      case 'fin':
        this.detenerGrabacion();
        this.mostrarFeedbackVoz('Grabación finalizada');
        break;
    }
  }

  agregarTextoACampoActivo(texto: string): void {
    if (this.campoActivo === 'ninguno') return;

    // Remover la palabra clave si está presente
    const textoLimpio = texto
      .replace(
        /diagnóstico|diagnostico|tratamiento|observaciones|observación|fin|terminar|detener/gi,
        ''
      )
      .trim();

    if (!textoLimpio) return;

    switch (this.campoActivo) {
      case 'diagnostico':
        this.consulta.diagnostico +=
          (this.consulta.diagnostico ? ' ' : '') + textoLimpio;
        break;
      case 'tratamiento':
        this.consulta.tratamiento +=
          (this.consulta.tratamiento ? ' ' : '') + textoLimpio;
        break;
      case 'observaciones':
        this.consulta.observaciones +=
          (this.consulta.observaciones ? ' ' : '') + textoLimpio;
        break;
    }

    this.textoTranscrito += textoLimpio + ' ';
  }

  // Control de grabación
  iniciarGrabacion(): void {
    if (!this.reconocimiento) {
      this.error = 'Reconocimiento de voz no disponible';
      return;
    }

    try {
      this.reconocimiento.start();
      this.grabando = true;
      this.mostrarPanelVoz = true;
      this.campoActivo = 'diagnostico'; // Campo por defecto
      this.textoTranscrito = 'Diagnóstico: ';
      this.mostrarFeedbackVoz(
        'Grabación iniciada. Diga: diagnóstico, tratamiento, observaciones o fin'
      );
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
      this.error = 'Error al iniciar el micrófono';
    }
  }

  detenerGrabacion(): void {
    if (this.reconocimiento && this.grabando) {
      this.reconocimiento.stop();
      this.grabando = false;
      this.campoActivo = 'ninguno';
      this.textoTranscrito = '';
    }
  }

  toggleGrabacion(): void {
    if (this.grabando) {
      this.detenerGrabacion();
    } else {
      this.iniciarGrabacion();
    }
  }

  // Atajos de teclado
  @HostListener('document:keydown', ['$event'])
  manejarAtajoTeclado(event: KeyboardEvent): void {
    // Ctrl + Shift + V para activar/desactivar grabación
    if (event.ctrlKey && event.shiftKey && event.key === 'V') {
      event.preventDefault();
      this.toggleGrabacion();
    }

    // Escape para detener grabación
    if (event.key === 'Escape' && this.grabando) {
      this.detenerGrabacion();
    }
  }

  // Utilidades
  mostrarFeedbackVoz(mensaje: string): void {
    // Podrías implementar síntesis de voz aquí
    console.log('Feedback voz:', mensaje);
  }

  // CORRECCIÓN: Método limpiarCampo con tipo seguro
  limpiarCampo(
    campo:
      | 'diagnostico'
      | 'tratamiento'
      | 'observaciones'
      | 'sintomas'
      | 'motivo_consulta'
  ): void {
    if (campo === 'diagnostico') {
      this.consulta.diagnostico = '';
    } else if (campo === 'tratamiento') {
      this.consulta.tratamiento = '';
    } else if (campo === 'observaciones') {
      this.consulta.observaciones = '';
    } else if (campo === 'sintomas') {
      this.consulta.sintomas = '';
    } else if (campo === 'motivo_consulta') {
      this.consulta.motivo_consulta = '';
    }
  }

  // Alternativa más elegante usando type assertion
  limpiarCampoAlternativo(campo: keyof ConsultaCreate): void {
    // Usamos type assertion para decirle a TypeScript que confíe en nosotros
    (this.consulta[campo] as string) = '';
  }

  // Envío del formulario
  guardar(): void {
    if (this.enviando) return;

    this.enviando = true;
    this.error = undefined;

    // Detener grabación si está activa
    if (this.grabando) {
      this.detenerGrabacion();
    }

    // Validaciones básicas
    if (!this.consulta.motivo_consulta) {
      this.error = 'El motivo de la consulta es obligatorio';
      this.enviando = false;
      return;
    }

    this.consultaService.createConsulta(this.consulta).subscribe({
      next: (consultaCreada) => {
        this.enviando = false;
        this.router.navigate(['/consultas'], {
          queryParams: {
            mensaje: `Consulta creada exitosamente para ${this.pacienteNombre} ${this.pacienteApellido}`,
            tipo: 'success',
          },
        });
      },
      error: (err) => {
        this.enviando = false;

        if (err.status === 400) {
          this.error = 'Datos inválidos. Verifica la información ingresada.';
          if (err.error) {
            const errores = Object.values(err.error).flat();
            if (errores.length > 0) {
              this.error = errores.join(', ');
            }
          }
        } else {
          this.error = 'Error al crear la consulta. Intenta nuevamente.';
        }

        console.error('Error creating consulta:', err);
      },
    });
  }

  cancelar(): void {
    if (this.grabando) {
      this.detenerGrabacion();
    }
    this.router.navigate(['/consultas']);
  }

  // Formateo de texto
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  ngOnDestroy(): void {
    if (this.grabando) {
      this.detenerGrabacion();
    }
  }
}
