%
% Procesado de señal de ECG mediante tres etapas:
%
%           1) Filtro paso-bajo desde 50 Hz para eliminar altas frecuencias
%           2) Filtro paso-alto para eliminar la DC
%           3) Filtro banda eliminada (notch) para eliminar la
%           interferencia de red eléctrica de 50 HZ
%
% Referencia del material usado:
%
% Las señales ECG y el script de lectura usado para obtenerlas son parte de
% un software disponible en 
%
%                           http://physionet.org/physiotools/wfdb.shtml
%
% Más información sobre autores/as e instituciones participantes en:
%
%       * Web de Physionet:  https://physionet.org/
% 
%       * Base de datos y recursos:  http://physionet.org/cgi-bin/ATM
%


load 'ecg_pract'

% Variables cargadas:
%
% val => val(1,:): ECG sin filtrar ; val(2,:): ECG filtrado
%
% x => vector del eje de tiempos
%

ecg = val(1,:);

figure(1);
plot(x,val(1,:),'b',x,val(2,:),'g');xlabel('Tiempo (s)');ylabel('Amplitud (mV)');legend('ECG medido','ECG filtrado')

% Frecuencia de muestreo
Fs = 1/(x(2)-x(1));
f = [-Fs/2:Fs/length(x):Fs/2-Fs/length(x)];


figure(2);
plot(f,fftshift(abs(fft(val(1,:)))),'b',f,fftshift(abs(fft(val(2,:)))),'r');legend('Espectro ECG medido','Espetro ECG filtrado');xlabel('Freq (Hz)');



%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
%%%%%%%         1) Filtro paso-bajo para eliminar altas frecuencias        
%
% Filtro paso-bajo de Butterworth (analógico) para obtener el orden y frecuencia de
% corte para después hacer el diseño del filtro paso-bajo digital
% correspondiente
%
fmax = Fs/2;

% Bandas de paso (hasta Wp, correspondiente a 45 Hz) y eliminada (desde Ws, correspondiente a 60 Hz) 
% normalizadas entre 0 y 1, donde 1 corresponde a
% pi radianes/muestra. La banda de transición se define entre estas dos
% frecuencias Wp y Ws.
Wp = [45]/fmax;
Ws = [60]/fmax;

Rp = 3; % dB ; Rizado máximo en la banda de paso
Rs = 40; % dB ; Mínima atenuación en la banda eliminada

% Según los parámetros anteriores, se obtiene el orden n y las frecuencias de corte Wn
[n,Wn] = buttord(Wp,Ws,Rp,Rs);

% Coeficientes del filtro de Butterworth
% b: coeficientes del numerador
% a: coeficientes del denominador
[b,a] = butter(n,Wn); 
    
% Respuesta en frecuencia del filtro digital correspondiente
[h,f2] = freqz(b,a,[],Fs);

% Módulo de la función de transferencia en escala lineal
figure(3);
plot(f2,abs(h));xlabel('Hz');ylabel('abs( H(z) )');title('Filtro paso-bajo Butterworth para eliminar alta frecuencia (lineal)')

% Módulo y fase de la función de transferencia en escala logarítmica
figure(4);
freqz(b,a,[],Fs);title('Filtro paso-bajo Butterworth para eliminar alta frecuencia')


% Coeficientes del filtro FIR mediante el método de las ventanas
b = fir1(n,Wn);

% Aplicación del filtrado paso-bajo
signal_lowpass = filter(b,1,ecg); % Sin correción del retardo

%
% Para corregir el retardo asociado a los filtros, se puede utilizar el
% comando 'filtfilt.m'. Su función es filtrar dos veces la señal (la
% segunda, después de una inversión temporal) para eliminar la distorión
% de fase. Esto requiere que todos los datos estén disponibles (se pierde
% la causalidad).
%
signal_lowpass = filtfilt(b,1,ecg); % Con corrección del retardo


figure(5);
plot(x,signal_lowpass,'r');xlabel('Tiempo (s)');ylabel('Amplitud (mV)');title('ECG con filtro paso bajo en torno a 50 Hz')

figure(6);
plot(f,abs(fftshift(fft(signal_lowpass))),'k');title('Espectro ECG después filtro paso-bajo');xlabel('Freq (Hz)');


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
%%%%%%%         2) Filtro paso-alto para eliminar DC
%
%
% Filtro IIR con un polo y un cero
% 
% bw : controla el ancho de banda de la banda eliminada.
% A mayor bw (valor absoluto tiende a 1), menor ancho de banda eliminada (más selectivo)
%
bw = -0.99;
a = [1 , bw]; b = [1,-1];

signal_low_highpass = filter(b,a,signal_lowpass); % Sin corrección del retardo


figure(7);
plot(x,signal_low_highpass,'g');xlabel('Tiempo (s)');ylabel('Amplitud (mV)');title('ECG + paso-bajo + paso-alto')

signal_filt_spec = fftshift(fft(signal_low_highpass));

figure(8);
plot(f,abs(signal_filt_spec),'g');title('Espectro ECG después filtro paso-bajo y paso-alto');xlabel('Freq (Hz)');


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
%%%%%%%        3) Filtro notch (banda eliminada) para la frecuencia de red 50 Hz
%
%
b = fir1(50,[40/fmax 60/fmax],'stop');

signal_notch = filter(b,1,signal_low_highpass); % Sin corrección de retardo


figure(9);
plot(f,abs(signal_filt_spec),'g',f,abs(fftshift(fft(signal_notch))),'c');title('Espectro ECG después filtro paso-bajo y paso-alto y Notch');...
    xlabel('Freq (Hz)');


figure(10);
plot(x,ecg,'b',x,signal_notch,'c');xlabel('Tiempo (s)');ylabel('Amplitud (mV)');legend('ECG medida','ECG filtrada')
