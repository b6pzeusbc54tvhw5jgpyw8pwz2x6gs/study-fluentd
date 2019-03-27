FROM fluent/fluentd:v1.3.3-1.0

USER root

RUN apk add --no-cache --update --virtual .build-deps \
  sudo build-base ruby-dev automake autoconf libtool geoip-dev \
  && gem install \
    fluent-plugin-secure-forward \
    fluent-plugin-elasticsearch \
    fluent-plugin-elb-log \
    dig_rb geoip-c geoip2_c \
    fluent-plugin-geoip \
    fluent-plugin-route \
    fluent-plugin-s3 \
  && gem sources --clear-all \
  && apk del .build-deps \
  && rm -rf /home/fluent/.gem/ruby/2.3.0/cache/*.gem

# USER fluent
