%Ejercicio 2 práctica 1 procesado de señales biomédicas
%
%En primer lugar hemos importado un conjunto de datos con 3 variables y a
%partir de ahí manipularemos los datos.
% En primer lugar debemos de representar gráficamente la variable hrv1.
figure(1);
plot(hrv1,'b.-'); ylabel("Pulsaciones/minuto");xlabel("Índice");

%Una vez hemos podido representar gráficamente la variable hrv1 ahora
%debemos de calcular la media de los valores y su desviación típica.
total=0;

for i=1:length(hrv1)
    total=hrv1(i)+total;

end

media=total/length(hrv1);
media2=mean(hrv1);
fprintf("La media de pulsaciones en los individuos registrados son: %.2f\n ", media);

desv_tip=sqrt((1/length(hrv1) * (sum((hrv1-media).^2))));
fprintf("La desviación típica de las pulsaciones de los individuos registrados es: %.2f\n ", desv_tip);


