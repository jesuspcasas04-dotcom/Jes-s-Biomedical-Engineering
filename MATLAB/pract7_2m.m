%
% Filtrado de señales de ultrasonido - Comparación de diferentes filtros
% para eliminar ruido
%
% Referencias:
%
% Datos y caso de estudio propuesto en 'Biomedical Signal Processing and Signal Modeling ', Eugene N. Bruce,
% 'Removing noise from ultrasound signals', p.333
%
load('cbfxmpl.mat');

% Variables (entre otras):
%
% cbf: señal ultrasonido sin filtrar
%
% t: vector del eje de tiempos
%

% Frecuencia de muestreo (Hz)
fs = 100;

% Eje temporal que se obtiene en función de la frecuencia de muestreo y la
% longitud de la secuencia
t = [0:1/fs:(length(cbf)-1)/fs];

figure(1);
plot(t,cbf);title('Datos medidos por el sensor de ultrasonidos');axis([0 t(end) 1e4 2.5e4]);...
    xlabel('Tiempo (s)')

%
% Se asume que las componentes por encima de 10 Hz son ruido =>
% fc = 10 Hz;
%
fc = 10;        % Frecuencia de corte
Wp = fc/(fs/2); % Pulsación de corte normalizada

%
% Filtro mediante el método de rizado constante (equiripple) ==> 'firpm'
% El orden del filtro es 25 (primer parámetro).
%
b=firpm(25,[0, Wp, Wp+0.1, 1],[1, 1 ,0, 0]);

% Dibujamos la respuesta en frecuencia de este filtro
figure(2);
freqz(b,1,[]);title('Respuesta en frecuencia del filtro FIR de rizado constante (equiripple)')


%
% Filtro mediante el método de ventana deslizante (Hamming) ==> 'fir1'
%
%
windowSize = 25;
bhamming = fir1(windowSize,Wp); % Equivalente a hacer:  b = (1/windowSize)*ones(1,windowSize); a = 1;

% Dibujamos la respuesta en frecuencia de este filtro
figure(3);
freqz(bhamming,1,[]);title('Respuesta en frecuencia del filtro FIR de ventana deslizante (Hamming)')


%
%%%%%% ELIMINACIÓN DE RUIDO MEDIANTE LOS FILTROS ANTERIORES
%

% Mediante rizado constante
output_pm = filter(b,1,cbf);

% Mediante ventana deslizante (Hamming)
output_hamming = filter(bhamming,1,cbf);



%
%%%%%%  MEJORA: FILTRO DE MEDIANA
%
% Ejemplo en 1D - Ventana de tres muestras (anterior, actual, posterior)
% 
% x = [2 80 6 3]
% 
% La salida filtrada sería:
% y[1] = Mediana[2 2 80] = 2
% y[2] = Mediana[2 80 6] = Mediana[2 6 80] = 6
% y[3] = Mediana[80 6 3] = Mediana[3 6 80] = 6
% y[4] = Mediana[6 3 3] = Mediana[3 3 6] = 3
% 
% Por tanto, y = [2 6 6 3]
%
%
output_median = medfilt1(cbf,3);

% Gráficas de todos los métodos
figure(4);
plot(t,cbf,'b',t,output_pm,'r',t,output_hamming,'g',t,output_median,'k');xlabel('Tiempo (s)');title('Entrada y salidas de los filtros');...
    legend('Señal medida','FIR de rizado constante (equiripple)','FIR de ventana deslizante (Hamming)','Filtro de mediana');axis([0 t(end) 1e4 2.5e4])
