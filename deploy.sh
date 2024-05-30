npm run build

aws s3 sync ./dist s3://demoai.parcel --acl public-read --profile logistic-dev

aws cloudfront create-invalidation \
    --distribution-id E1S7CCKFD4ZZRQ  \
    --paths "/*" \
    --profile logistic-dev