%
 %%%%%% Cuantificación
 %
 % Realiza una cuantificación según una función de cuantificación
 %
 % x: secuencia original
 % xq: señal cuantificada
 %
 % Señal
 fa = 1000;  % Frecuencia de la señal analógica
 fs = 50000;  % Frecuencia de muestreo
 N = 100;  % Número de muestras de la secuencia
 n = 0:N; 
 x = cos((2*pi*fa/fs)*n); % Señal ñseno’ discreta a implementar en el Ejercicio 1


 % Margen dinámico de la señal
 md = (max(x)-min(x));



 % Nº bits
 B = 3;
 % Nº niveles de cuantificaci´ on
 L = 2^B;
 % Margen dinámico del cuantificador IGUAL AL margen dinámico de la señal
 mdc = 1*md;
 % Escal´ on de cuantificación (resoluci´ on)
 escalon = mdc / 2^B;
 % Función del cuantificador Q(x[n]) ==> A implementar en el Ejercicio 2
 % ...
if(abs(x)< (mdc/2))
    xq = (int((abs(x)) / escalon) + 1/2) * escalon * sign(x);
else
    xq = ((L-1) / 2)* escalon * sign(x);
end


 figure(3);
 plot(x,'.-'); hold on; plot(xq,'*-r');
 legend('Secuencia x[n]','Secuencia cuantificada xq[n]');grid

    
 % Relaci´ on se˜ nal-ruido de cuantificaci´ on te´ orica
 SQNR_dB_teo = 1.76 + 6.02*B
 
 % Relaci´ on se˜ nal-ruido de cuantificaci´ on te´ orica
Ex = x*x';
xnueva = x -xq
Ee = xnueva*xnueva';

 SQNR = 10 * log(Ex/Ee);

 %%
fa = 1000;      % Frecuencia de la señal analógica (Hz)
fs = 50000;     % Frecuencia de muestreo (Hz)
N = 100;        % Número de muestras
n = 0:N;

% Señal seno discreta
x = cos(2*pi*fa*n/fs);


% Parámetros de cuantificación
B = 3;                  % Nº de bits
L = 2^B;                % Nº de niveles
md = max(x) - min(x);   % Margen dinámico de la señal
mdc = 2*md;               % Margen dinámico del cuantificador (puedes cambiarlo a 0.5*md o 2*md)
escalon = mdc / L;

% Cuantificador uniforme
xq = zeros(size(x));
for i = 1:length(x)
    if abs(x(i)) < mdc/2
        xq(i) = (floor(abs(x(i))/escalon) + 0.5)*escalon * sign(x(i));
    else
        xq(i) = ((L-1)/2)*escalon * sign(x(i));
    end
end

figure(4);
plot(x, '.-'); hold on;
plot(xq, '*-r');
legend('x[n] original', 'xq[n] cuantificada'); grid on;


% Teórico
SQNR_dB_teo = 1.76 + 6.02*B;


Ex = x*x';
xnueva = x -xq
Ee = xnueva*xnueva';

 SQNR = 10 * log(Ex/Ee);

%%
  %
 %%%%%% Cuantificación
 %
 % Realiza una cuantificación según una función de cuantificación
 %
 % x: secuencia original
 % xq: señal cuantificada
 %
 % Señal
 fa = 1000;  % Frecuencia de la señal analógica
 fs = 50000;  % Frecuencia de muestreo
 N = 100;  % Número de muestras de la secuencia
 n = 0:N; 
 x = cos((2*pi*fa/fs)*n); % Señal ñseno’ discreta a implementar en el Ejercicio 1


 % Margen dinámico de la señal
 md = (max(x)-min(x));



 % Nº bits
 B = 3;
 % Nº niveles de cuantificaci´ on
 L = 2^B;
 % Margen dinámico del cuantificador IGUAL AL margen dinámico de la señal
 mdc = (1/2)*md;
 % Escal´ on de cuantificación (resoluci´ on)
 escalon = mdc / 2^B;
 % Función del cuantificador Q(x[n]) ==> A implementar en el Ejercicio 2
 % ...
if(abs(x)< (mdc/2))
    xq = (int((abs(x)) / escalon) + 1/2) * escalon * sign(x);
else
    xq = ((L-1) / 2)* escalon * sign(x);
end


 figure(5);
 plot(x,'.-'); hold on; plot(xq,'*-r');
 legend('Secuencia x[n]','Secuencia cuantificada xq[n]');grid


 % Relaci´ on se˜ nal-ruido de cuantificaci´ on te´ orica
 SQNR_dB_teo = 1.76 + 6.02*B
 
 % Relaci´ on se˜ nal-ruido de cuantificaci´ on te´ orica
Ex = x*x';
xnueva = x -xq
Ee = xnueva*xnueva';

SQNR = 10*log(Ex/Ee);